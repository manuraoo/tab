import React from 'react'
import { goTo, dashboardURL } from 'js/navigation/navigation'

// A view we can show before sign-in.
class IntroView extends React.Component {
  render() {
    return (
      <div>
        <h1>Hi there!</h1>
        <div
          onClick={() => {
            goTo(dashboardURL)
          }}
        >
          Continue
        </div>
      </div>
    )
  }
}

IntroView.propTypes = {}
IntroView.defaultProps = {}

export default IntroView
