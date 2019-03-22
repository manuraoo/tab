/* eslint-env jest */

import React from 'react'
import { mount, shallow } from 'enzyme'
import toJson from 'enzyme-to-json'
import Input from '@material-ui/core/Input'
import SearchIcon from '@material-ui/icons/Search'
import { isSearchPageEnabled } from 'js/utils/feature-flags'
import { dashboardURL, modifyURLParams } from 'js/navigation/navigation'
import { externalRedirect } from 'js/navigation/utils'
import SearchResults from 'js/components/Search/SearchResults'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import detectAdblocker from 'js/utils/detectAdblocker'
import { flushAllPromises } from 'js/utils/test-utils'

jest.mock('js/utils/feature-flags')
jest.mock('js/navigation/navigation')
jest.mock('js/navigation/utils')
jest.mock('js/components/Search/SearchResults')
jest.mock('js/utils/detectAdblocker')

// Enzyme does not yet support React.lazy and React.Suspense,
// so let's just not render lazy-loaded children for now.
// https://github.com/airbnb/enzyme/issues/1917
jest.mock('react', () => {
  const React = jest.requireActual('react')
  React.Suspense = () => null
  React.lazy = jest.fn(() => () => null)
  return React
})

const getMockProps = () => ({
  user: {
    id: 'some-user-id-here',
  },
  app: {},
  location: {
    search: '',
  },
})

beforeEach(() => {
  isSearchPageEnabled.mockReturnValue(true)
})

afterEach(() => {
  detectAdblocker.mockResolvedValue(false)
  jest.clearAllMocks()
})

describe('Search page component', () => {
  it('renders without error', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    shallow(<SearchPageComponent {...mockProps} />).dive()
  })

  it('renders without error when user and app props are not defined', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    delete mockProps.app
    delete mockProps.user
    shallow(<SearchPageComponent {...mockProps} />).dive()
  })

  it('renders no DOM elements when the search page feature is not enabled', () => {
    isSearchPageEnabled.mockReturnValue(false)
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(toJson(wrapper)).toEqual('')
  })

  it('redirects to the dashboard when the search page feature is not enabled', () => {
    isSearchPageEnabled.mockReturnValue(false)
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(externalRedirect).toHaveBeenCalledWith(dashboardURL)
  })

  it('renders DOM elements when the search page feature is enabled', () => {
    isSearchPageEnabled.mockReturnValue(true)
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(toJson(wrapper)).not.toEqual('')
  })

  it('does not redirect to the dashboard when the search page feature is enabled', () => {
    isSearchPageEnabled.mockReturnValue(true)
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(externalRedirect).not.toHaveBeenCalled()
  })

  it('sets the "query" state to the value of the "q" URL param on mount', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location = {
      search: '?q=yumtacos',
    }
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.state('query')).toEqual('yumtacos')
  })

  it('sets the "page" state to the value of the "page" URL param on mount', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location = {
      search: '?page=14',
    }
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.state('page')).toEqual(14)
  })

  it('sets the "page" state to 1 if the value of the "page" URL param is not a valid integer', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location = {
      search: '?age=foo',
    }
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.state('page')).toEqual(1)
  })

  it('sets the "p" query parameter to the page number when clicking to a new results page', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location = {
      search: '?page=14',
    }
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const onPageChangeHandler = wrapper.find(SearchResults).prop('onPageChange')
    onPageChangeHandler(7)
    expect(modifyURLParams).toHaveBeenCalledWith({
      page: 7,
    })
    onPageChangeHandler(102)
    expect(modifyURLParams).toHaveBeenCalledWith({
      page: 102,
    })
  })

  it('shows the search text in the box when loading a previous search', () => {
    isSearchPageEnabled.mockReturnValue(true)
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=blahblah'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.find(Input).prop('value')).toBe('blahblah')
  })

  it('clicking the search button updates the "q" URL parameter, sets the page to 1, and sets the "src" to "self"', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = mount(<SearchPageComponent {...mockProps} />)
    const searchInput = wrapper
      .find(Input)
      .first()
      .find('input')

    // https://github.com/airbnb/enzyme/issues/76#issuecomment-189606849
    searchInput.simulate('change', { target: { value: 'free ice cream' } })

    wrapper.find(SearchIcon).simulate('click')
    expect(modifyURLParams).toHaveBeenCalledWith({
      q: 'free ice cream',
      page: 1,
      src: 'self',
    })
  })

  it('hitting enter in the search input updates the "q" URL parameter, sets the page to 1, and sets the "src" to "self"', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = mount(<SearchPageComponent {...mockProps} />)
    const searchInput = wrapper
      .find(Input)
      .first()
      .find('input')
    searchInput
      .simulate('change', { target: { value: 'register to vote' } })
      .simulate('keypress', { key: 'Enter' })
    expect(modifyURLParams).toHaveBeenCalledWith({
      q: 'register to vote',
      page: 1,
      src: 'self',
    })
  })

  it('does not update the "q" URL parameter if the search query is an empty string', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = mount(<SearchPageComponent {...mockProps} />)
    const searchInput = wrapper
      .find(Input)
      .first()
      .find('input')
    searchInput
      .simulate('change', { target: { value: '' } })
      .simulate('keypress', { key: 'Enter' })
    expect(modifyURLParams).not.toHaveBeenCalled()
  })

  it('passes the decoded query to the SearchResults component', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=foo&another=thing'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.find(SearchResults).prop('query')).toEqual('foo')

    // Update the search parameter.
    wrapper.setProps(
      Object.assign({}, mockProps, {
        location: {
          search: '?q=something%20here',
        },
      })
    )
    expect(wrapper.find(SearchResults).prop('query')).toEqual('something here')
  })

  it('passes the page number to the SearchResults component', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=foo&page=12'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.find(SearchResults).prop('page')).toBe(12)
  })

  it('passes "1" as the default page number to the SearchResults component when the "page" URL param is not set', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=foo'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.find(SearchResults).prop('page')).toBe(1)
  })

  it('passes the search source to the SearchResults component when the "page" URL param is set', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=foo&src=some-source'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.find(SearchResults).prop('searchSource')).toEqual(
      'some-source'
    )
  })

  it('passes null as the search source to the SearchResults component when the "src" URL param is not set', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=foo'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.find(SearchResults).prop('searchSource')).toBeNull()
  })

  it('passes "self" as the "searchSource" the SearchResults component when entering a new search on the page', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = mount(<SearchPageComponent {...mockProps} />)
    expect(wrapper.find(SearchResults).prop('searchSource')).toBeNull()
    const searchInput = wrapper
      .find(Input)
      .first()
      .find('input')
    searchInput
      .simulate('change', { target: { value: 'register to vote' } })
      .simulate('keypress', { key: 'Enter' })
    expect(wrapper.find(SearchResults).prop('searchSource')).toEqual('self')
  })

  // This is important for prerendering scripts for search results.
  it('renders the SearchResults component on mount even if there is no query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    expect(wrapper.find(SearchResults).exists()).toBe(true)
    expect(wrapper.find(SearchResults).prop('query')).toEqual('')
  })

  it('contains all the expected search category tabs', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tabs = wrapper.find(Tabs)
    const expectedTabs = ['Web', 'Images', 'News', 'Videos', 'Maps']
    expectedTabs.forEach(tabText => {
      const tabExists =
        tabs.find(Tab).filterWhere(n => n.render().text() === tabText)
          .length === 1
      if (!tabExists) {
        throw new Error(
          `Expected to render a search category tab "${tabText}".`
        )
      }
    })
  })

  it('has the expected outbound link for the "Images" search category tab when there is a search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=mini%20golf'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'Images')
    expect(tab.prop('href')).toBe(
      'https://www.google.com/search?q=mini%20golf&tbm=isch'
    )
  })

  it('has the expected outbound link for the "Images" search category tab when there is no search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'Images')
    expect(tab.prop('href')).toBe('https://images.google.com')
  })

  it('has the expected outbound link for the "News" search category tab when there is a search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=mini%20golf'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'News')
    expect(tab.prop('href')).toBe(
      'https://www.google.com/search?q=mini%20golf&tbm=nws'
    )
  })

  it('has the expected outbound link for the "News" search category tab when there is no search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'News')
    expect(tab.prop('href')).toBe('https://www.google.com')
  })

  it('has the expected outbound link for the "Video" search category tab when there is a search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=mini%20golf'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'Videos')
    expect(tab.prop('href')).toBe(
      'https://www.google.com/search?q=mini%20golf&tbm=vid'
    )
  })

  it('has the expected outbound link for the "Video" search category tab when there is no search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'Videos')
    expect(tab.prop('href')).toBe('https://www.google.com')
  })

  it('has the expected outbound link for the "Maps" search category tab when there is a search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = '?q=mini%20golf'
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'Maps')
    expect(tab.prop('href')).toBe('https://www.google.com/maps/?q=mini%20golf')
  })

  it('has the expected outbound link for the "Maps" search category tab when there is no search query', () => {
    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    mockProps.location.search = ''
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    const tab = wrapper
      .find(Tabs)
      .find(Tab)
      .filterWhere(n => n.render().text() === 'Maps')
    expect(tab.prop('href')).toBe('https://www.google.com/maps')
  })

  it('shows the "ad blocker enabled" message when we detect an ad blocker', async () => {
    expect.assertions(1)

    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    detectAdblocker.mockResolvedValue(true)
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    await flushAllPromises()
    expect(
      wrapper.find('[data-test-id="search-prevented-warning"]').exists()
    ).toBe(true)
  })

  it('does not show the "ad blocker enabled" message when we do not detect an ad blocker', async () => {
    expect.assertions(1)

    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    detectAdblocker.mockResolvedValue(false)
    const wrapper = shallow(<SearchPageComponent {...mockProps} />).dive()
    await flushAllPromises()
    expect(
      wrapper.find('[data-test-id="search-prevented-warning"]').exists()
    ).toBe(false)
  })

  it('calls console.error when the ad blocker detection throws', async () => {
    expect.assertions(1)

    const SearchPageComponent = require('js/components/Search/SearchPageComponent')
      .default
    const mockProps = getMockProps()
    const mockErr = new Error('Oh nooooo')
    detectAdblocker.mockImplementation(() => Promise.reject(mockErr))
    const mockConsoleError = jest.fn()
    jest.spyOn(console, 'error').mockImplementationOnce(mockConsoleError)
    shallow(<SearchPageComponent {...mockProps} />).dive()
    await flushAllPromises()
    expect(mockConsoleError).toHaveBeenCalledWith(mockErr)
  })
})
