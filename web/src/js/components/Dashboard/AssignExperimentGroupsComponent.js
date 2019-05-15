import React from 'react'
import PropTypes from 'prop-types'
import { assignUserToTestGroups } from 'js/utils/experiments'

class AssignExperimentGroups extends React.Component {
  componentDidMount() {
    const { onComplete, user } = this.props

    try {
      // Assign the user to experiment groups. We do this every
      // page load because the user may have become eligble for
      // an experiment (e.g. by having joined X days ago) or we
      // may have added new experiments.
      assignUserToTestGroups({
        id: user.id,
        numUsersRecruited: user.numUsersRecruited,
        joined: user.joined,
        isNewUser: this.props.isNewUser,
      })
      onComplete(true)
    } catch (e) {
      onComplete(false)
    }
  }

  render() {
    return null
  }
}

AssignExperimentGroups.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    joined: PropTypes.string.isRequired,
    numUsersRecruited: PropTypes.number.isRequired,
  }).isRequired,
  isNewUser: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
}

AssignExperimentGroups.defaultProps = {
  isNewUser: false,
  onComplete: () => {},
}

export default AssignExperimentGroups
