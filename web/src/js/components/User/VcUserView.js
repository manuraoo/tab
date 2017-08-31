/* global graphql */

import React from 'react'
import {QueryRenderer} from 'react-relay/compat'
import environment from '../../../relay-env'
import AuthUserComponent from 'general/AuthUserComponent'

import ErrorMessage from 'general/ErrorMessage'
import VcUserContainer from './VcUserContainer'

class VcUserView extends React.Component {
  render () {
    return (
      <AuthUserComponent>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query VcUserViewQuery($userId: String!) {
              user(userId: $userId) {
                ...VcUserContainer_user
              }
            }
          `}
          render={({error, props}) => {
            if (error) {
              console.error(error, error.source)
              const errMsg = 'We had a problem getting your Hearts and level count :('
              return <ErrorMessage message={errMsg} />
            }
            if (props) {
              return (
                <VcUserContainer user={props.user} />
              )
            } else {
              return null
            }
          }} />
      </AuthUserComponent>
    )
  }
}

export default VcUserView
