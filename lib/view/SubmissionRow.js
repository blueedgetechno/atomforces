'use babel';

import React from 'react';
import opn from 'opn';
import { secondsToCountdownString } from '../utils';
import Verdict from './Verdict';

function SubmissionCreationTime(props) {
    if (props.participantType === 'CONTESTANT' ||
            props.participantType === 'OUT_OF_COMPETITION' ||
            props.participantType === 'VIRTUAL') {
        return secondsToCountdownString(props.relativeTime, 2);
    } else {
        return new Date(props.creationTime * 1000).toLocaleString();
    }
}

export default class SubmissionRow extends React.PureComponent {

    constructor(props) {
        super(props);

        this.openSubmission = this.openSubmission.bind(this);
    }

    openSubmission() {
        opn(`https://codeforces.com/contest/${this.props.submission.codeforcesContestId}/submission/${this.props.submission.codeforcesId}`);
    }

    render() {
        return <tr onClick={this.openSubmission}>
            <td>
                <SubmissionCreationTime
                    participantType={this.props.submission.participantType}
                    creationTime={this.props.submission.creationTime}
                    relativeTime={this.props.submission.relativeTime} />
            </td>
            <td>{this.props.submission.language}</td>
            <td>
                <Verdict
                    verdict={this.props.submission.verdict}
                    testset={this.props.submission.testset}
                    passedTestCount={this.props.submission.passedTestCount} />
            </td>
            <td>{this.props.submission.time} ms</td>
            <td>{this.props.submission.memory / 1024} KB</td>
        </tr>
    }

}
