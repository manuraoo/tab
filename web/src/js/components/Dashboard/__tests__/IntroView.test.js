/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'

const getMockProps = () => ({})

describe('IntroView', () => {
  it('renders without error', () => {
    const IntroView = require('js/components/Dashboard/IntroView').default
    const mockProps = getMockProps()
    shallow(<IntroView {...mockProps} />)
  })

  it('says "hi there"', async () => {
    const IntroView = require('js/components/Dashboard/IntroView').default
    const mockProps = getMockProps()
    const wrapper = shallow(<IntroView {...mockProps} />)
    expect(
      wrapper
        .find('h1')
        .first()
        .text()
    ).toEqual('Hi there!')
  })
})
