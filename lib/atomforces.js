'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import config from './config';
import Dialog from './dialog/dialog';
import * as defaultData from './view/data.json'
import CodeforcesScraper from './business/codeforces-scraper';
import { startWatching } from './business/file-watcher';
import { prepareStandaloneProblem } from './business/directory-preparer';
import { handleError, pathIsInside } from './utils';
import { addContest, clearStores, updateLogin, addStandaloneProblem,
    setProgrammingLanguage, setCompilationCommand, setRunCommand,
    setSkipCompilation, setAutoCompilation, setAutoEvaluation,
    setTemplateSnippetPrefix, setTemplateSnippetScope,
    setFileStructureProblemDirectory, setFileStructureSourceFileName,
    setFileStructureExecutableName,
    setFileStructureInputFileName, setFileStructureInputFileRegex,
    setFileStructureOutputFileName, setFileStructureOutputFileRegex } from './data/atomforces-actions';
import LoginStore from './data/login-store';
import ContestStore from './data/contest-store';
import ProblemStore from './data/problem-store';
import ConfigStore from './data/config-store';
import SubmissionStore from './data/submission-store';

const TERMINAL_TAB_URI = 'terminal-tab://';

export default {

    config,
    atomforcesView: null,
    subscriptions: null,
    treeView: null,
    snippets: null,

    activate(state) {
        require('atom-package-deps').install('atomforces').then(() => {

            // Have to import this after the installation of terminal-tabs!
            const AtomforcesRoot = require('./view/AtomforcesRoot');

            if (state) {
                const { login, contests, problems, submissions } = state;
                if (login && contests && problems && submissions) {
                    LoginStore.load(login);
                    ContestStore.load(contests);
                    ProblemStore.load(problems);
                    SubmissionStore.load(submissions);
                    // console.log(LoginStore);
                    // console.log(ContestStore);
                    // console.log(ProblemStore);
                    // console.log(SubmissionStore);
                }
            }

            startWatching();

            this.subscriptions = new CompositeDisposable(
                atom.config.observe('atomforces.codeforcesHandle', newValue => {
                    updateLogin({ handle: newValue, loggedIn: false });
                }),
                atom.config.observe('atomforces.accountPassword', newValue => {
                    updateLogin({ password: newValue, loggedIn: false });
                }),
                atom.config.observe('atomforces.programmingLanguage', newValue => {
                    setProgrammingLanguage(newValue);
                    var data = defaultData.defaults[newValue];
                    if(data!=null){
                      var filename = "<%= siblingPrefix %><%= problem %>"
                      if(data.copy!=null) data = defaultData.defaults[data.copy];
                      if(data.skipCompilation==null) data.skipCompilation=false;
                      if(data.scope==null) data.scope = ".source"+data.ext;
                      if(data.compile) data.compile = data.compile.replace("<%=file%>", filename)
                      if(data.run) data.run = data.run.replace("<%=file%>", filename)

                      data.sourceFileName = atom.config.get('atomforces.fileStructure.sourceFileName')
                      data.sourceFileName = data.sourceFileName.split(".")[0] + data.ext

                      if(data.scope != atom.config.get("atomforces.templateSnippet.scope")){
                        atom.config.set("atomforces.compilation.skipCompilation", data.skipCompilation);
                        if(data.compile){
                          atom.config.set("atomforces.compilation.compilationCommand", data.compile);
                        }
                        if(data.run){
                          atom.config.set("atomforces.runner.runCommand", data.run);
                        }
                        atom.config.set("atomforces.templateSnippet.scope", data.scope);
                        atom.config.set("atomforces.fileStructure.sourceFileName", data.sourceFileName);
                      }
                    }
                }),
                atom.config.observe('atomforces.compilation.skipCompilation', newValue => {
                    setSkipCompilation(newValue);
                }),
                atom.config.observe('atomforces.compilation.autoCompilation', newValue => {
                    setAutoCompilation(newValue && !atom.config.get('atomforces.compilation.skipCompilation'));
                }),
                atom.config.observe('atomforces.compilation.compilationCommand', newValue => {
                    setCompilationCommand(newValue);
                }),
                atom.config.observe('atomforces.runner.autoEvaluation', newValue => {
                    setAutoEvaluation(newValue);
                }),
                atom.config.observe('atomforces.runner.runCommand', newValue => {
                    setRunCommand(newValue);
                }),
                atom.config.observe('atomforces.templateSnippet.prefix', newValue => {
                    setTemplateSnippetPrefix(newValue);
                }),
                atom.config.observe('atomforces.templateSnippet.scope', newValue => {
                    setTemplateSnippetScope(newValue);
                }),
                atom.config.observe('atomforces.fileStructure.problemDirectory', newValue => {
                    setFileStructureProblemDirectory(newValue);
                }),
                atom.config.observe('atomforces.fileStructure.sourceFileName', newValue => {
                    setFileStructureSourceFileName(newValue);
                }),
                atom.config.observe('atomforces.fileStructure.executableName', newValue => {
                    setFileStructureExecutableName(newValue);
                }),
                atom.config.observe('atomforces.fileStructure.inputFileName', newValue => {
                    setFileStructureInputFileName(newValue);
                }),
                atom.config.observe('atomforces.fileStructure.inputFileRegex', newValue => {
                    setFileStructureInputFileRegex(newValue);
                }),
                atom.config.observe('atomforces.fileStructure.outputFileName', newValue => {
                    setFileStructureOutputFileName(newValue);
                }),
                atom.config.observe('atomforces.fileStructure.outputFileRegex', newValue => {
                    setFileStructureOutputFileRegex(newValue);
                }),
                atom.workspace.addOpener(uri => {
                    if (uri.startsWith(TERMINAL_TAB_URI + '/')) {
                        const terminalTabPath = atom.packages.resolvePackagePath('terminal-tab');
                        if (terminalTabPath != undefined) {
                            const TerminalSession = require(terminalTabPath + '/lib/terminal-session');
                            return new TerminalSession({
                                workingDirectory: uri.substring(TERMINAL_TAB_URI.length)
                            });
                        } else {
                            atom.notifications.addWarning("You need to install the package terminal-tab first.");
                            return null;
                        }
                    }
                }),
                atom.workspace.addOpener(uri => {
                    if (uri === 'atom://atomforces') {
                        return new AtomforcesRoot(state.atomforcesViewState);
                    }
                }),
                atom.commands.add('atom-workspace', {
                    'atomforces:toggle': () => this.toggle(),
                    'atomforces:connect-contest': () => this.startConnectContest(),
                    'atomforces:connect-problem': () => this.startConnectProblem(),
                    'atomforces:clear': clearStores
                }),
                new Disposable(() => {
                    atom.workspace.getPaneItems().forEach(item => {
                        if (item instanceof AtomforcesRoot) {
                            item.destroy();
                        }
                    });
                })
            );
        });
    },

    serialize() {
        return {
            login: LoginStore.serialize(),
            contests: ContestStore.serialize(),
            problems: ProblemStore.serialize(),
            submissions: SubmissionStore.serialize()
        };
    },

    deactivate() {
        if (this.subscriptions) this.subscriptions.dispose();
        CodeforcesScraper.destroy();
    },

    consumeTreeView(treeView) {
        this.treeView = treeView;
    },

    consumeSnippets(snippets) {
        this.snippets = snippets;
    },

    toggle() {
        atom.workspace.toggle('atom://atomforces');
    },

    checkCollision(filePath) {
        if (Array.from(ContestStore.getPathToIdMap().keys()).find(p => pathIsInside(p, filePath))) {
            atom.notifications.addError('The selected directory is inside of another connected contest');
            return true;
        }
        if (Array.from(ContestStore.getPathToIdMap().keys()).find(p => pathIsInside(filePath, p))) {
            atom.notifications.addError('The selected directory contains another connected contest');
            return true;
        }
        if (Array.from(ProblemStore.getStandalonePathToIdMap().keys()).find(p => pathIsInside(p, filePath))) {
            atom.notifications.addError('The selected directory is inside of another standalone problem');
            return true;
        }
        if (Array.from(ProblemStore.getStandalonePathToIdMap().keys()).find(p => pathIsInside(filePath, p))) {
            atom.notifications.addError('The selected directory contains another standalone problem');
            return true;
        }
        return false;
    },

    startConnectContest() {
        if (!this.treeView) return;
        const paths = this.treeView.selectedPaths();
        if (!paths || paths.length !== 1) return;
        var path = paths[0];
        if (!path) return;
        this.dialog = new Dialog({
            promptText: 'Please enter the contest id',
            onConfirm: contestId => this.connectContest(path, parseInt(contestId)),
            checkInput: text => /^\d+$/.test(text)
        });
        this.dialog.attach();
    },

    connectContest(filePath, contestId) {
        this.dialog.close();
        if (this.checkCollision(filePath)) return;
        CodeforcesScraper.getBasicContest(contestId).then(contestData => {
            addContest({
                filePath,
                codeforcesId: contestId,
                name: contestData.name,
                phase: contestData.phase,
                type: contestData.type,
                duration: contestData.durationSeconds,
                startTime: contestData.startTimeSeconds,
                siblingContests: contestData.siblingContests
            });
        }).catch(error => {
            handleError(error, 'Could not connect contest.');
        });
    },

    startConnectProblem() {
        if (!this.treeView) return;
        const paths = this.treeView.selectedPaths();
        if (!paths || paths.length !== 1) return;
        var path = paths[0];
        if (!path) return;
        this.dialog = new Dialog({
            promptText: 'Please enter the problem index (used for filenames)',
            onConfirm: problemIndex => this.connectProblem(path, problemIndex),
            checkInput: text => /^.+$/.test(text)
        });
        this.dialog.attach();
    },

    connectProblem(filePath, index) {
        this.dialog.close();
        if (this.checkCollision(filePath)) return;
        addStandaloneProblem({
            filePath,
            index
        });
        prepareStandaloneProblem(ContestStore.nextProblemId - 1);
    },

    getTreeView() {
        return this.treeView;
    },

    getSnippets() {
        return this.snippets;
    }

};
