'use babel';

import React from 'react';
import CollapsableSubsection from './CollapsableSubsection';
import SubmissionContainer from './SubmissionContainer';
import { shallowEqualArrays } from 'shallow-equal';

// props: submissions (list of ids), submissionClicked
export default class SubmissionsSection extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = { collapsed: true };
        this.toggleCollapsed = this.toggleCollapsed.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (!shallowEqualArrays(prevProps.submissions, this.props.submissions)) {
            this.setState({ collapsed: false });
        }
    }

    toggleCollapsed() {
        this.setState(state => ({ collapsed: !state.collapsed }));
    }

    render() {
        return <CollapsableSubsection
                collapsed={this.state.collapsed}
                toggleCollapsed={this.toggleCollapsed}
                heading=<span><span className="mr-4">Submissions</span>
                    {this.props.isSubmitting && <span className="loading loading-spinner-tiny inline-block" />}</span>>
            <table className="table">
                <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                </colgroup>
                <tbody>
                    {this.props.submissions.map(submissionId =>
                        <SubmissionContainer submissionId={submissionId} key={submissionId} />
                    )}
                </tbody>
            </table>
        </CollapsableSubsection>
    }

}
