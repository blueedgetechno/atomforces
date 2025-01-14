'use babel';

import path from 'path';

export function arraysEqual(array1, array2) {
    if (array1 == null && array2 == null) return true;
    if (array1 == null || array2 == null) return false;
    if (array1.length !== array2.length) return false;
    return array1.every((item, index) => item === array2[index]);
};

export function handleError(error, title) {
    console.log(error);
    
    if (!error || !error.error) {
        if (error.data) atom.notifications.addError(title, { detail: error.data });
        else atom.notifications.addError(title);
        return;
    }
    if (error.error == 'atomforces' || error.error == 'codeforces') {
        atom.notifications.addError(title, { detail: error.message });
    } else if (error.error == 'axios') {
        if (error.repeatedNetworkErrors <= 1)
            atom.notifications.addError(title, { detail: error.data });
    }
}

// time in remaining seconds
// zeros: 1 - force output of minutes
//        2 - force output of hours
//        3 - force output of days
export function secondsToCountdownString(time, zeros) {
    var numbers = [];
    if (time >= 60 * 60 * 24 || zeros >= 3) {
        numbers.push(Math.floor(time / (60 * 60 * 24)));
    }
    if (time >= 60 * 60 || zeros >= 2) {
        numbers.push(Math.floor((time % (60 * 60 * 24)) / (60 * 60)));
    }
    if (time >= 60 || zeros >= 1) {
        numbers.push(Math.floor((time % (60 * 60)) / 60));
    }
    numbers.push(Math.floor(time % 60));

    return numbers
        .map(val => (val < 10 ? '0' : '') + val.toString())
        .join(':');
}

export function pathIsInside(root, sub) {
    const relative = path.relative(root, sub);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function exampleIsBad(example, enableChecking) {
    if (!example) return false;

    if (example.outdated) return false;
    else if (example.manuallyKilled) return false;
    else if (example.exitCode === -1) return true;
    else if (example.exitCode != null && example.exitCode !== 0) return true;
    else if (example.signal != null) return true;
    else if (example.output != null && example.exitCode == null) return false;
    else if (enableChecking && example.checkingOk) return false;
    else if (enableChecking && !example.checkingOk) return true;
    else if (example.output != null) return false;
    else return false;
}

export function searchRoot(p, roots) {
    p = path.normalize(p);
    while (!roots.has(p)) {
        const next = path.normalize(path.dirname(p));
        if (path.relative(next, p) === '') return null;
        p = next;
    }
    return p;
}

export function findDivFromContestName(name) {
    const res = name.match(/div\s*\.?\s*(\d)/i)
    if (res) return parseInt(res[1]);
    else return -1;
}

export function getSiblingContestPrefix(name, codeforcesId) {
    const div = findDivFromContestName(name);
    if (div == -1) return codeforcesId.toString();
    else return 'Div' + div;
}
