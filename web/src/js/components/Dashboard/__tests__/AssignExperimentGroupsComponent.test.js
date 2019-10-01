/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'
import { assignUserToTestGroups } from 'js/utils/experiments'

jest.mock('js/utils/experiments')

const getMockProps = () => ({
  onComplete: jest.fn(),
  user: {
    id: 'some-user-id',
    joined: '2017-05-19T13:59:58.000Z',
    numUsersRecruited: 2,
  },
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('AssignExperimentGroupsComponent', function() {
  it('renders without error and does not have any DOM elements', () => {
    const AssignExperimentGroupsComponent = require('js/components/Dashboard/AssignExperimentGroupsComponent')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<AssignExperimentGroupsComponent {...mockProps} />)
    expect(toJson(wrapper)).toEqual('')
  })

  it('calls to assign experiment groups', () => {
    const AssignExperimentGroupsComponent = require('js/components/Dashboard/AssignExperimentGroupsComponent')
      .default
    const mockProps = getMockProps()
    shallow(<AssignExperimentGroupsComponent {...mockProps} />)
    expect(assignUserToTestGroups).toHaveBeenCalledWith({
      id: 'some-user-id',
      isNewUser: false,
      joined: '2017-05-19T13:59:58.000Z',
      numUsersRecruited: 2,
    })
  })

  it('calls the onComplete callback with a value of true when assigning experiment groups is successful', () => {
    const AssignExperimentGroupsComponent = require('js/components/Dashboard/AssignExperimentGroupsComponent')
      .default
    const mockProps = getMockProps()
    shallow(<AssignExperimentGroupsComponent {...mockProps} />)
    expect(mockProps.onComplete).toHaveBeenCalledWith(true)
  })

  it('calls the onComplete callback with a value of false when assigning experiment groups fails', () => {
    assignUserToTestGroups.mockImplementationOnce(() => {
      throw new Error('Uh oh.')
    })
    const AssignExperimentGroupsComponent = require('js/components/Dashboard/AssignExperimentGroupsComponent')
      .default
    const mockProps = getMockProps()
    shallow(<AssignExperimentGroupsComponent {...mockProps} />)
    expect(mockProps.onComplete).toHaveBeenCalledWith(false)
  })

  it('still works when the onComplete prop is not defined', () => {
    const AssignExperimentGroupsComponent = require('js/components/Dashboard/AssignExperimentGroupsComponent')
      .default
    const mockProps = getMockProps()
    delete mockProps.onComplete
    shallow(<AssignExperimentGroupsComponent {...mockProps} />)
    expect(assignUserToTestGroups).toHaveBeenCalledTimes(1)
  })
})
