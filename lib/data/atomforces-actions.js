'use babel';

import AtomforcesDispatcher from './atomforces-dispatcher';

var showLog = true;
export function clearStores() {
    if(showLog) console.log('CLEAR_STORES');
    AtomforcesDispatcher.dispatch({
        type: 'CLEAR_STORES'
    });
}

export function updateLogin(login) {
    if(showLog){
      console.log('UPDATE_LOGIN');
      console.log(login);
    }
    AtomforcesDispatcher.dispatch({
        type: 'UPDATE_LOGIN',
        login
    });
}

export function addContest(contest) {
    if(showLog){
      console.log('ADD_CONTEST');
      console.log(contest);
    }
    AtomforcesDispatcher.dispatch({
        type: 'ADD_CONTEST',
        contest
    });
}

export function updateContest(contestId, contest) {
    if(showLog){
      console.log('UPDATE_CONTEST');
      console.log(contestId);
      console.log(contest);
    }
    AtomforcesDispatcher.dispatch({
        type: 'UPDATE_CONTEST',
        contestId,
        contest
    });
}

export function removeContest(contestId) {
    if(showLog){
      console.log('REMOVE_CONTEST');
      console.log(contestId);
    }
    AtomforcesDispatcher.dispatch({
        type: 'REMOVE_CONTEST',
        contestId
    });
}

export function setProblems(contestId, problems) {
    if(showLog){
      console.log('SET_PROBLEMS');
      console.log(contestId);
      console.log(problems);
    }
    AtomforcesDispatcher.dispatch({
        type: 'SET_PROBLEMS',
        contestId,
        problems
    });
}

export function addStandaloneProblem(problem) {
    if(showLog){
      console.log('ADD_STANDALONE_PROBLEM');
      console.log(problem);
    }
    AtomforcesDispatcher.dispatch({
        type: 'ADD_STANDALONE_PROBLEM',
        problem
    });
}

export function removeStandaloneProblem(problemId) {
    if(showLog){
      console.log('REMOVE_STANDALONE_PROBLEM');
      console.log(problemId);
    }
    AtomforcesDispatcher.dispatch({
        type: 'REMOVE_STANDALONE_PROBLEM',
        problemId
    });
}

export function setSubmissions(problemId, submissions) {
    if(showLog){
      console.log('SET_SUBMISSIONS');
      console.log(problemId);
      console.log(submissions);
    }
    AtomforcesDispatcher.dispatch({
        type: 'SET_SUBMISSIONS',
        problemId,
        submissions
    });
}

export function updateCompilation(problemId, compilation) {
    if(showLog){
      console.log('UPDATE_COMPILATION');
      console.log(problemId);
      console.log(compilation);
    }
    AtomforcesDispatcher.dispatch({
        type: 'UPDATE_COMPILATION',
        problemId,
        compilation
    });
}

export function updateProblem(problemId, problem) {
    if(showLog){
      console.log('UPDATE_PROBLEM');
      console.log(problemId);
      console.log(problem);
    }
    AtomforcesDispatcher.dispatch({
        type: 'UPDATE_PROBLEM',
        problemId,
        problem
    });
}

export function setExamples(problemId, examples) {
    if(showLog){
      console.log('SET_EXAMPLES');
      console.log(problemId);
      console.log(examples);
    }
    AtomforcesDispatcher.dispatch({
        type: 'SET_EXAMPLES',
        problemId,
        examples
    });
}

export function updateExample(problemId, example) {
    if(showLog){
      console.log('UPDATE_EXAMPLE');
      console.log(problemId);
      console.log(example);
    }
    AtomforcesDispatcher.dispatch({
        type: 'UPDATE_EXAMPLE',
        problemId,
        example
    });
}

export function outdateAllExamples(problemId) {
    if(showLog){
      console.log('OUTDATE_ALL_EXAMPLES');
      console.log(problemId);
    }
    AtomforcesDispatcher.dispatch({
        type: 'OUTDATE_ALL_EXAMPLES',
        problemId
    });
}

export function setProgrammingLanguage(programmingLanguage) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_PROGRAMMING_LANGUAGE',
        programmingLanguage
    });
}

export function setCompilationCommand(compilationCommand) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_COMPILATION_COMMAND',
        compilationCommand
    });
}

export function setRunCommand(runCommand) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_RUN_COMMAND',
        runCommand
    });
}

export function setSkipCompilation(skipCompilation) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_SKIP_COMPILATION',
        skipCompilation
    });
}

export function setAutoCompilation(autoCompilation) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_AUTO_COMPILATION',
        autoCompilation
    });
}

export function setAutoEvaluation(autoEvaluation) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_AUTO_EVALUATION',
        autoEvaluation
    });
}

export function setTemplateSnippetPrefix(templateSnippetPrefix) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_TEMPLATE_SNIPPET_PREFIX',
        templateSnippetPrefix
    });
}

export function setTemplateSnippetScope(templateSnippetScope) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_TEMPLATE_SNIPPET_SCOPE',
        templateSnippetScope
    });
}

export function setFileStructureProblemDirectory(fileStructureProblemDirectory) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_FILE_STRUCTURE_PROBLEM_DIRECTORY',
        fileStructureProblemDirectory
    });
}

export function setFileStructureSourceFileName(fileStructureSourceFileName) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_FILE_STRUCTURE_SOURCE_FILE_NAME',
        fileStructureSourceFileName
    });
}

export function setFileStructureExecutableName(fileStructureExecutableName) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_FILE_STRUCTURE_EXECUTABLE_NAME',
        fileStructureExecutableName
    });
}

export function setFileStructureInputFileName(fileStructureInputFileName) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_FILE_STRUCTURE_INPUT_FILE_NAME',
        fileStructureInputFileName
    });
}

export function setFileStructureInputFileRegex(fileStructureInputFileRegex) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_FILE_STRUCTURE_INPUT_FILE_REGEX',
        fileStructureInputFileRegex
    });
}

export function setFileStructureOutputFileName(fileStructureOutputFileName) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_FILE_STRUCTURE_OUTPUT_FILE_NAME',
        fileStructureOutputFileName
    });
}

export function setFileStructureOutputFileRegex(fileStructureOutputFileRegex) {
    AtomforcesDispatcher.dispatch({
        type: 'SET_FILE_STRUCTURE_OUTPUT_FILE_REGEX',
        fileStructureOutputFileRegex
    });
}
