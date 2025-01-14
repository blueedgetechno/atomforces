'use babel';

import axios from 'axios';
import cheerio from 'cheerio';
import tunnel from 'tunnel';

const BASE_URL = 'https://codeforces.com';

class CodeforcesScraper {

    constructor() {
        this.timer = null;
        this.queue = [];
        this.lock = false;
        this.repeatedNetworkErrors = 0;
        this.instance = axios.create({
            baseURL: BASE_URL,
            transformRequest: data => {
                var str = [];
                for (const p in data) {
                    if (data.hasOwnProperty(p)) {
                        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
                    }
                }
                return str.join('&');
            }
        });
    }

    destroy() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    resetNumberOfNetworkErrors() {
        this.repeatedNetworkErrors = 0;
    }

    callFirstInQueue() {
        if (this.queue.length < 1) return;
        if (this.lock) return;
        this.lock = true;
        this.queue[0](() => {
            this.queue.shift();
            this.timer = setTimeout(() => {
                this.lock = false;
                this.callFirstInQueue();
            }, 1000);
        });
    }

    enqueue(f) {
        this.queue.push(f);
        if (this.queue.length === 1) {
            this.callFirstInQueue();
        }
    }

    fetch(url, config = {}) {
        return new Promise((resolve, reject) => {
            this.enqueue(done => {
                this.instance(url, config).then((response) => {
                    done();
                    this.repeatedNetworkErrors = 0;
                    if (response.status !== 200) {
                        reject({ error: 'atomforces', message: 'Received bad status code', data: response });
                        return;
                    }
                    resolve(response);
                }).catch(error => {
                    done();
                    // Repeated network/server errors can be ignored
                    if (error.response && (error.response.status < 500 || error.response.status >= 600)) this.repeatedNetworkErrors = 0;
                    else this.repeatedNetworkErrors++;
                    reject({ error: 'axios', data: error, repeatedNetworkErrors: this.repeatedNetworkErrors });
                });
            });
        });
    }

    fetchHTMLAndResponse(url, config = {}) {
        return this.fetch(url, config).then(response => [cheerio.load(response.data), response]);
    }

    fetchHTML(url, config = {}) {
        return this.fetch(url, config).then(response => cheerio.load(response.data));
    }

    fetchCodeforcesAPI(method, params) {
        return new Promise((resolve, reject) => {
            this.fetch(`/api/${method}`, { params })
                .then(response => {
                    const data = response.data;
                    if (data.status !== 'OK') {
                        reject({ error: 'codeforces', message: data.comment, data: response });
                        return;
                    }
                    resolve(data.result);
                })
                .catch(error => {
                    reject(error);
                });
        })
    }

    getBasicContest(contestId) {
        return new Promise((resolve, reject) => {
            this.fetchCodeforcesAPI('contest.list', {}).then(res => {
                const contestData = res.find(item => item.id === contestId);
                if (!contestData) {
                    reject({ error: 'atomforces', message: 'Contest not found', data: res });
                    return;
                }
                const siblingContests = res.filter(item =>
                    item.startTimeSeconds === contestData.startTimeSeconds &&
                    item.durationSeconds === contestData.durationSeconds &&
                    item.id !== contestData.id).map(item => ({
                        codeforcesId: item.id,
                        name: item.name
                    }));
                resolve({...contestData, siblingContests});
            }).catch(error => reject(error));
        })
    }

    getContestTasks(contestId) {
        return new Promise((resolve, reject) => {
            this.fetchCodeforcesAPI('contest.standings', {
                contestId: contestId,
                from: 1,
                count: 1
            }).then(res => {
                resolve(res.problems);
            }).catch(error => {
                reject(error);
            });
        });
    }

    getUserRank(contestId,handle) {
        return new Promise((resolve, reject) => {
            this.fetchCodeforcesAPI('contest.standings', {
                contestId: contestId,
                handles: handle
            }).then(res => {
                resolve(res.rows && res.rows[0] && res.rows[0].rank);
            }).catch(error => {
                reject(error);
            });
        });
    }

    getUserStandings(contestId,handles) {
        return new Promise((resolve, reject) => {
            this.fetchCodeforcesAPI('contest.standings', {
                contestId: contestId,
                handles: handles.join(";")
            }).then(res => {
                resolve(res);
            }).catch(error => {
                // ;
                var data = error;
                try{
                  data = data.data.response.data.comment;
                }catch(e){
                  data = null;
                }

                reject(data);
            });
        });
    }

    getProblemSubCount(contestId) {
        return new Promise((resolve, reject) => {
            this.fetchHTML(`/contest/${contestId}`).then(res => {
                var query="#pageContent > div.datatable > div:nth-child(6) > table > tbody > tr",
                    rows = res(query), subcount = {}

                for (var i = 1; i < rows.length; i++) {
                    var index = count = res(`${query}:nth-child(${i+1}) > td:nth-child(1)`).text().trim(),
                        count = res(`${query}:nth-child(${i+1}) > td:nth-child(4)`).text().trim()
                    subcount[index] = count
                }

                resolve(subcount)
            }).catch(error => {
                reject(error);
            });
        });
    }

    getSamples(contestId, taskIndex) {
        return new Promise((resolve, reject) => {
            this.fetchHTML(`/contest/${contestId}/problem/${taskIndex}`)
                .then(res => {
                    var inputs = res('.sample-test').children('.input');
                    var outputs = res('.sample-test').children('.output');
                    if (!inputs.length || !outputs.length) {
                        reject({ error: 'atomforces', message: 'No samples found.', data: res });
                        return;
                    }
                    inputs = inputs.map(function(i, item) {
                        return res(this).children('pre').text();
                    }).get();
                    outputs = outputs.map(function(i, item) {
                        return res(this).children('pre').text();
                    }).get();
                    if (inputs.length !== outputs.length) {
                        reject({ error: 'atomforces', message: 'Number of sample inputs and outputs do not match.', data: res });
                        return;
                    }
                    resolve(inputs.map((_, c) => [inputs[c], outputs[c]]));
                }).catch(error => {
                    reject(error);
                });
        });
    }

    getSubmissions({ contestId, handle }) {
        return new Promise((resolve, reject) => {
            this.fetchCodeforcesAPI('contest.status', {
                contestId,
                handle
            }).then(res => {
                    const submissions = res.map(item => {
                        const submission = {
                            codeforcesId: item.id,
                            codeforcesContestId: item.problem.contestId,
                            verdict: item.verdict,
                            passedTestCount: item.passedTestCount,
                            testset: item.testset,
                            time: item.timeConsumedMillis,
                            memory: item.memoryConsumedBytes,
                            language: item.programmingLanguage,
                            participantType: item.author.participantType,
                            participantStartTime: item.author.startTimeSeconds,
                            creationTime: item.creationTimeSeconds,
                            relativeTime: item.relativeTimeSeconds
                        };
                        return {
                            problemIndex: item.problem.index,
                            submission
                        };
                    });
                    resolve(submissions);
                }).catch(error => {
                    if (error.error === 'axios' && error.data.response && error.data.response.status === 500) {
                        resolve([]);
                    }
                    reject(error);
                });
        });
    }

    getHandle() {
        return this.fetchHTML('/').then(res => {
            return res('.personal-sidebar .avatar a.rated-user').text();
        });
    }

    getUser(handle) {
        return this.fetchCodeforcesAPI('user.info',{
          handles: handle
        }).then(res => {
            return res[0]
        }).catch(err=> {});
    }

    // resolves to true on success or false on error
    login(handle, password) {
        return this.fetchHTML('/enter').then(res => {
            if (res('#userbox').length) return true; // already logged in
            const form = res('#enterForm');
            if (!form) throw { error: 'atomforces', message: 'Login form not found', data: res };

            return this.fetchHTML('/enter', {
                method: 'post',
                data: {
                    csrf_token: res('input[name=csrf_token]', form).attr('value'),
                    action: 'enter',
                    handleOrEmail: handle,
                    password: password,
                    remember: 'on'
                }
            }).then(res => {
                return true;
            });
        });
    }

    logout() {
        return this.fetchHTML('/').then(res => {
            const promises = [];
            res('.lang-chooser a').each((i, item) => {
                const link = res(item).attr('href');
                if (!link) return;
                if (/^\/[0-9a-f]{32}\/logout$/.test(link)) {
                    promises.push(this.fetchHTML(link));
                    return;
                }
            });
            return Promise.all(promises);
        });
    }

    submit(contestId, problemIndex, source, programmingLanguage) {
        const url = `/contest/${contestId}/submit`;
        return this.fetchHTMLAndResponse(url).then(([res, response]) => {
            const form = res('.submit-form');
            if (form.length && response.request.responseURL === BASE_URL + url) return [res, form];
            else throw { error: 'atomforces', message: 'Submit form not found', data: res };
        }).then(([res, form]) => {
            return this.fetchHTML(url, {
                method: 'post',
                data: {
                    csrf_token: res('input[name=csrf_token]', form).attr('value'),
                    action: 'submitSolutionFormSubmitted',
                    submittedProblemIndex: problemIndex,
                    programTypeId: programmingLanguage,
                    source
                }
            })
        });
    }
}

export default new CodeforcesScraper();
