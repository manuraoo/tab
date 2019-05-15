import React from 'react'
import PropTypes from 'prop-types'
import graphql from 'babel-plugin-relay/macro'
import { QueryRenderer } from 'react-relay'
import environment from 'js/relay-env'

import withUser from 'js/components/General/withUser'
import AssignExperimentGroups from 'js/components/Dashboard/AssignExperimentGroupsContainer'

class AssignExperimentGroupsView extends React.Component {
  componentDidMount() {
    const { authUser, onComplete } = this.props
    if (!(authUser && authUser.id)) {
      onComplete(false)
    }
  }

  // TODO: we should create a shared QueryRenderer that handles
  //   user creation when the user does not exist.
  render() {
    const { authUser, onComplete } = this.props
    return (
      <div style={{ display: 'none' }}>
        {authUser && authUser.id ? (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query AssignExperimentGroupsViewQuery($userId: String!) {
                user(userId: $userId) {
                  ...AssignExperimentGroupsContainer_user
                }
              }
            `}
            variables={{
              userId: authUser.id,
            }}
            render={({ error, props, retry }) => {
              if (error) {
                return () => {
                  // If we don't assign experiment groups here because we redirect or the
                  // user does not yet exist, that's okay. We'll try to assign the user to
                  // experiments on the dashboard as well.
                  onComplete(false)
                }
              } else if (props) {
                const { user } = props
                if (!user) {
                  return () => {
                    onComplete(false)
                  }
                }
                return (
                  <AssignExperimentGroups
                    user={user}
                    isNewUser
                    onComplete={onComplete}
                  />
                )
              }
            }}
          />
        ) : null}
      </div>
    )
  }
}

AssignExperimentGroupsView.propTypes = {
  authUser: PropTypes.shape({
    id: PropTypes.string,
  }),
  onComplete: PropTypes.func.isRequired,
}

AssignExperimentGroupsView.defaultProps = {
  onComplete: () => {},
}

export default withUser({
  renderIfNoUser: true,
  redirectToAuthIfIncomplete: false,
})(AssignExperimentGroupsView)
