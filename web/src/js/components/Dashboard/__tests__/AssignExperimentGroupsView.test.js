/* eslint-env jest */

import React from 'react'
import { mount, shallow } from 'enzyme'
import AssignExperimentGroupsView from 'js/components/Dashboard/AssignExperimentGroupsView'
import AssignExperimentGroupsContainer from 'js/components/Dashboard/AssignExperimentGroupsContainer'
import { QueryRenderer } from 'react-relay'

jest.mock('react-relay')
jest.mock('js/components/General/ErrorMessage')
jest.mock('js/analytics/logEvent')
jest.mock('js/components/General/withUser')
jest.mock('js/components/Dashboard/AssignExperimentGroupsContainer')

const getMockProps = () => ({
  authUser: {
    id: 'example-user-id',
  },
  onComplete: jest.fn(),
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('withUser HOC in AssignExperimentGroupsView', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('is called with the expected options', () => {
    const withUser = require('js/components/General/withUser').default

    /* eslint-disable-next-line no-unused-expressions */
    require('js/components/Dashboard/AssignExperimentGroupsView').default
    expect(withUser).toHaveBeenCalledWith({
      createUserIfPossible: true,
      renderIfNoUser: true,
      redirectToAuthIfIncomplete: false,
    })
  })

  it('wraps the AssignExperimentGroupsView component', () => {
    const {
      __mockWithUserWrappedFunction,
    } = require('js/components/General/withUser')

    /* eslint-disable-next-line no-unused-expressions */
    require('js/components/Dashboard/AssignExperimentGroupsView').default
    const wrappedComponent = __mockWithUserWrappedFunction.mock.calls[0][0]
    expect(wrappedComponent.name).toEqual('AssignExperimentGroupsView')
  })
})

describe('AssignExperimentGroupsView', () => {
  it('renders without error', () => {
    const mockProps = getMockProps()
    shallow(<AssignExperimentGroupsView {...mockProps} />).dive()
  })

  it('includes QueryRenderer', () => {
    const mockProps = getMockProps()
    const wrapper = shallow(
      <AssignExperimentGroupsView {...mockProps} />
    ).dive()
    expect(wrapper.find(QueryRenderer).length).toBe(1)
  })

  it('passes the expected variables to the QueryRenderer', () => {
    const mockProps = getMockProps()
    const wrapper = shallow(
      <AssignExperimentGroupsView {...mockProps} />
    ).dive()
    expect(wrapper.find(QueryRenderer).prop('variables')).toEqual({
      userId: 'example-user-id', // from the authUser prop
    })
  })

  it('calls the onComplete callback with a value of false if no user exists', () => {
    const mockProps = getMockProps()
    mockProps.authUser = undefined
    shallow(<AssignExperimentGroupsView {...mockProps} />).dive()
    expect(mockProps.onComplete).toHaveBeenCalledWith(false)
  })

  it('calls the onComplete callback with a value of false if the user does not have an ID', () => {
    const mockProps = getMockProps()
    mockProps.authUser.id = undefined
    shallow(<AssignExperimentGroupsView {...mockProps} />).dive()
    expect(mockProps.onComplete).toHaveBeenCalledWith(false)
  })

  it('calls the onComplete callback with a value of true if AssignExperimentGroupsContainer calls it with true', () => {
    QueryRenderer.__setQueryResponse({
      error: null,
      props: {
        user: {
          id: 'abc',
        },
      },
      retry: jest.fn(),
    })
    const mockProps = getMockProps()
    const wrapper = mount(<AssignExperimentGroupsView {...mockProps} />)
    const cb = wrapper.find(AssignExperimentGroupsContainer).prop('onComplete')
    cb(true)
    expect(mockProps.onComplete).toHaveBeenCalledWith(true)
    expect(mockProps.onComplete).toHaveBeenCalledTimes(1)
  })
})
