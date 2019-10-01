import React from 'react'
import { dashboardURL, introURL, replaceUrl } from 'js/navigation/navigation'
import {
  setBrowserExtensionInstallId,
  setBrowserExtensionInstallTime,
} from 'js/utils/local-user-data-mgr'
import AssignExperimentGroupsView from 'js/components/Dashboard/AssignExperimentGroupsView'

// TODO: first, set up and deploy the general structure to do
// experiments. Then, set up the experiment.

// The view the extensions open immediately after they're
// added to the browser.
class FirstTabView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      renderChildren: false,
    }
  }

  componentDidMount() {
    // Here, we can do anything we need to do before
    // going to the main dashboard.

    // Set a unique install ID in local storage.
    setBrowserExtensionInstallId()

    // Set this as the user's installed time, which helps us
    // distinguish truly new users from returning users who
    // had cleared their local data.
    setBrowserExtensionInstallTime()

    // Important: the extension install time must be set
    // before we call the `withUser` HOC, which relies on knowing
    // the installation time.
    this.setState({
      renderChildren: true,
    })
  }

  onExperimentAssignmentComplete(success) {
    if (!success) {
      replaceUrl(dashboardURL)
    } else {
      // TODO: check experiment groups and show alternate experience
      replaceUrl(introURL)
    }
  }

  render() {
    const { renderChildren } = this.state

    // TODO: potentially show a "loading" state while we wait
    // for user creation, experiment assignment, and redirect.
    if (!renderChildren) {
      return null
    }
    return (
      <div>
        <AssignExperimentGroupsView
          onComplete={this.onExperimentAssignmentComplete.bind(this)}
        />
      </div>
    )
  }
}

export default FirstTabView
