'use babel';

import chokidar from 'chokidar';
import fs from 'fs-plus';
import path from 'path';
import ContestStore from '../data/contest-store';
import ProblemStore from '../data/problem-store';
import ConfigStore from '../data/config-store';
import { removeContest, updateCompilation, outdateAllExamples } from '../data/atomforces-actions';
import { pathIsInside, searchRoot } from '../utils';
import { fileChanged } from './example-updater';
import compile from './compiler';
import { runAllExamples } from './example-runner';

var watcher = null;
const watched = new Set();

function changed(p) {
    const contestRoot = searchRoot(p, ContestStore.getPathToIdMap());
    var problemId = null;
    if (contestRoot) {
        const rel = path.relative(contestRoot, p);
        const contest = ContestStore.getContests().get(ContestStore.getPathToIdMap().get(contestRoot));
        if (!contest.problems) return;
        const problem = contest.problems.find(problem => {
            return pathIsInside(ConfigStore.getFileStructureProblemDirectory()({ problem: problem.index, siblingPrefix: problem.siblingPrefix }), rel);
        });
        if (!problem) return;
        problemId = problem.id;
    } else {
        const standaloneProblemRoot = searchRoot(p, ProblemStore.getStandalonePathToIdMap());
        if (!standaloneProblemRoot) return;
        problemId = ProblemStore.getStandalonePathToIdMap().get(standaloneProblemRoot);
    }
    problem = ProblemStore.getProblems().get(problemId);
    if (!problem) return;

    var isFileChanged = path.relative(p, path.join(problem.filePath, ConfigStore.getFileStructureSourceFileName()({ problem: problem.index, siblingPrefix: problem.siblingPrefix })))==='',
        isOutChanged = path.relative(p, path.join(problem.filePath, ConfigStore.getFileStructureExecutableName()({ problem: problem.index }))) == ''

    if (isFileChanged && !ConfigStore.getSkipCompilation()) {
        updateCompilation(problemId, { outdated: true });
        if (ConfigStore.getAutoCompilation() && problem.autoActivated) {
            compile(problemId);
        }
    } else if (isOutChanged || (isFileChanged && ConfigStore.getSkipCompilation())) {
        outdateAllExamples(problemId);
        if (ConfigStore.getAutoEvaluation() && problem.autoActivated && !problem.compilation.killProcess) {
            runAllExamples(problemId);
        }
    } else {
        fileChanged(problemId, p, path.relative(problem.filePath, p));
    }
}

function directoryRemoved(p) {
    if (!ContestStore.getPathToIdMap().has(p)) return;
    const contestId = ContestStore.getPathToIdMap().get(p);
    removeContest(contestId);
}

function updateWatcher() {
    watched.forEach(filePath => {
        if (!ContestStore.getPathToIdMap().has(filePath) && !ProblemStore.getStandalonePathToIdMap().has(filePath)) {
            watcher.unwatch(filePath);
            watched.delete(filePath);
        }
    });
    Array.from(ContestStore.getContests().entries()).forEach(([contestId, contest]) => {
        if (watched.has(contest.filePath)) return;
        if (fs.existsSync(contest.filePath)) {
            watcher.add(contest.filePath);
            watched.add(contest.filePath);
        } else {
            removeContest(contestId);
        }
    });
    Array.from(ProblemStore.getStandalonePathToIdMap().keys()).forEach(filePath => {
        if (watched.has(filePath)) return;
        if (fs.existsSync(filePath)) {
            watcher.add(filePath);
            watched.add(filePath);
        } else {
            removeStandaloneProblem(ProblemStore.getStandalonePathToIdMap().get(filePath));
        }
    })
}

export function startWatching() {
    watcher = chokidar.watch([], {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 100
        }
    });
    watcher.on('add', changed);
    watcher.on('change', changed);
    watcher.on('unlink', changed);
    watcher.on('unlinkDir', directoryRemoved);

    updateWatcher();
    ContestStore.addListener('list', updateWatcher);
    ProblemStore.addListener('list', updateWatcher);
}
