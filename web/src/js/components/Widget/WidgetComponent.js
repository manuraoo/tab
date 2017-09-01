import React from 'react'
import PropTypes from 'prop-types'

import UpdateWidgetVisibilityMutation from 'mutations/UpdateWidgetVisibilityMutation'

// Widget Types.
import BookmarksWidget from './Widgets/Bookmarks/BookmarksWidgetContainer'
import SearchWidget from './Widgets/Search/SearchWidgetContainer'
import ClockWidget from './Widgets/Clock/ClockWidgetContainer'
import NotesWidget from './Widgets/Notes/NotesWidgetContainer'
import TodosWidget from './Widgets/Todos/TodosWidgetContainer'

class Widget extends React.Component {
  widgetVisibilityChanged (user, widget, visible) {
    UpdateWidgetVisibilityMutation.commit(
      this.props.relay.environment,
      user,
      widget,
      visible
    )
  }

  render () {
    const { widget, user } = this.props

    switch (widget.type) {
      case 'bookmarks':
        return (<BookmarksWidget
          widget={widget}
          user={user}
          widgetVisibilityChanged={this.widgetVisibilityChanged.bind(this)}
          showError={this.props.showError} />)
      case 'search':
        return (<SearchWidget
          widget={widget}
          user={user} />)

      case 'clock':
        return (<ClockWidget
          widget={widget}
          user={user} />)

      case 'notes':
        return (<NotesWidget
          widget={widget}
          user={user}
          widgetVisibilityChanged={this.widgetVisibilityChanged.bind(this)}
          showError={this.props.showError} />)

      case 'todos':
        return (<TodosWidget
          widget={widget}
          user={user}
          widgetVisibilityChanged={this.widgetVisibilityChanged.bind(this)}
          showError={this.props.showError} />)
      default:
        return null
    }
  }
}

Widget.propTypes = {
  widget: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  showError: PropTypes.func.isRequired
}

export default Widget
