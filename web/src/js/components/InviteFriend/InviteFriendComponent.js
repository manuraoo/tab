import React from 'react'
import PropTypes from 'prop-types'

import InvitePopover from './InvitePopover'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'

import {
  grey300
} from 'material-ui/styles/colors'

class InviteFriend extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false
    }
  }

  handleTouchTap (event) {
    // This prevents ghost click.
    event.preventDefault()

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    })
  }

  handleInvitePopoverRequestClose () {
    this.setState({
      open: false
    })
  }

  render () {
    const { user } = this.props
    const username = user ? user.username : ''

    return (
      <div>
        <IconButton
          tooltip='Invite Friend'
          tooltipPosition='top-left'
          onTouchTap={this.handleTouchTap.bind(this)}>
          <FontIcon
            color={grey300}
            hoverColor={'#FFF'}
            className='fa fa-users fa-lg' />
        </IconButton>

        <InvitePopover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          username={username}
          onRequestClose={this.handleInvitePopoverRequestClose.bind(this)} />
      </div>
    )
  }
}

InviteFriend.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired
  }).isRequired
}

export default InviteFriend
