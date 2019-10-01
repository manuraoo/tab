/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'
import MockDate from 'mockdate'
import { replaceUrl } from 'js/navigation/navigation'
import {
  setBrowserExtensionInstallId,
  setBrowserExtensionInstallTime,
} from 'js/utils/local-user-data-mgr'
import AssignExperimentGroupsView from 'js/components/Dashboard/AssignExperimentGroupsView'

jest.mock('js/navigation/navigation')
jest.mock('js/utils/local-user-data-mgr')
jest.mock('js/components/Dashboard/AssignExperimentGroupsView')

const mockNow = '2017-05-19T13:59:58.000Z'

beforeEach(() => {
  MockDate.set(moment(mockNow))
})

afterEach(() => {
  jest.clearAllMocks()
  MockDate.reset()
})

const mockProps = {}

describe('FirstTabView', function() {
  it('renders without error', () => {
    const FirstTabView = require('js/components/Dashboard/FirstTabView').default
    shallow(<FirstTabView {...mockProps} />)
  })

  it('renders AssignExperimentGroupsView', () => {
    const FirstTabView = require('js/components/Dashboard/FirstTabView').default
    const wrapper = shallow(<FirstTabView {...mockProps} />)
    expect(wrapper.find(AssignExperimentGroupsView).exists()).toBe(true)
  })

  it('redirects to the dashboard when AssignExperimentGroupsView fails to assign the user', () => {
    const FirstTabView = require('js/components/Dashboard/FirstTabView').default
    const wrapper = shallow(<FirstTabView {...mockProps} />)
    const assignExpGroupsCallback = wrapper
      .find(AssignExperimentGroupsView)
      .prop('onComplete')
    assignExpGroupsCallback(false)
    expect(replaceUrl).toHaveBeenCalledWith('/newtab/')
  })

  // TODO: test with experiment and control groups
  it('redirects to the "intro" page when AssignExperimentGroupsView assigns the user to the experimental group', () => {
    const FirstTabView = require('js/components/Dashboard/FirstTabView').default
    const wrapper = shallow(<FirstTabView {...mockProps} />)
    const assignExpGroupsCallback = wrapper
      .find(AssignExperimentGroupsView)
      .prop('onComplete')
    assignExpGroupsCallback(true)
    expect(replaceUrl).toHaveBeenCalledWith('/newtab/intro/')
  })

  it('calls to set the extension install ID in local storage', () => {
    const FirstTabView = require('js/components/Dashboard/FirstTabView').default
    shallow(<FirstTabView {...mockProps} />)
    expect(setBrowserExtensionInstallId).toHaveBeenCalledTimes(1)
  })

  it('calls to set the extension install time in local storage', () => {
    const FirstTabView = require('js/components/Dashboard/FirstTabView').default
    shallow(<FirstTabView {...mockProps} />)
    expect(setBrowserExtensionInstallTime).toHaveBeenCalledTimes(1)
  })
})
