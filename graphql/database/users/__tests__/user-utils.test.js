/* eslint-env jest */

import moment from 'moment'
import { getMockUserInstance, mockDate } from '../../test-utils'

const mockCurrentTime = '2017-06-22T01:13:28.000Z'

beforeAll(() => {
  mockDate.on(mockCurrentTime, {
    mockCurrentTimeOnly: true,
  })
})

afterAll(() => {
  mockDate.off()
})

describe('user utils', () => {
  test('getTodayTabCount calculates the correct amount when maxTabsDay has a recentDay of today', () => {
    const mockUser = getMockUserInstance({
      maxTabsDay: {
        maxDay: {
          date: moment.utc().toISOString(),
          numTabs: 400,
        },
        recentDay: {
          date: moment.utc().toISOString(),
          numTabs: 148,
        },
      },
    })
    const { getTodayTabCount } = require('../user-utils')
    expect(getTodayTabCount(mockUser)).toBe(148)
  })

  test('getTodayTabCount calculates the correct amount when maxTabsDay has a recentDay of prior to today', () => {
    const mockUser = getMockUserInstance({
      maxTabsDay: {
        maxDay: {
          date: moment.utc().toISOString(),
          numTabs: 400,
        },
        recentDay: {
          date: '2017-06-18T01:13:28.000Z', // not today
          numTabs: 14,
        },
      },
    })
    const { getTodayTabCount } = require('../user-utils')
    expect(getTodayTabCount(mockUser)).toBe(0)
  })

  test('getTodaySearchCount calculates the correct amount when maxSearchesDay has a recentDay of today', () => {
    const mockUser = getMockUserInstance({
      maxSearchesDay: {
        maxDay: {
          date: moment.utc().toISOString(),
          numSearches: 400,
        },
        recentDay: {
          date: moment.utc().toISOString(),
          numSearches: 148,
        },
      },
    })
    const { getTodaySearchCount } = require('../user-utils')
    expect(getTodaySearchCount(mockUser)).toBe(148)
  })

  test('getTodaySearchCount calculates the correct amount when maxSearchesDay has a recentDay of prior to today', () => {
    const mockUser = getMockUserInstance({
      maxSearchesDay: {
        maxDay: {
          date: moment.utc().toISOString(),
          numSearches: 400,
        },
        recentDay: {
          date: '2017-06-18T01:13:28.000Z', // not today
          numSearches: 14,
        },
      },
    })
    const { getTodaySearchCount } = require('../user-utils')
    expect(getTodaySearchCount(mockUser)).toBe(0)
  })

  test('calculateMaxTabs correctly updates both maxDay and recentDay keys', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment
          .utc()
          .subtract(1, 'days')
          .toISOString(),
        numTabs: 14,
      },
      recentDay: {
        date: '2017-06-18T01:13:28.000Z', // not today
        numTabs: 10,
      },
    }
    const { calculateMaxTabs } = require('../user-utils')
    expect(calculateMaxTabs(15, mockMaxDay)).toEqual({
      maxDay: {
        date: moment.utc().toISOString(),
        numTabs: 15,
      },
      recentDay: {
        date: moment.utc().toISOString(), // today
        numTabs: 15,
      },
    })
  })

  test('calculateMaxTabs correctly updates only recentDay keys', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(),
        numTabs: 200,
      },
      recentDay: {
        date: moment.utc().toISOString(), // not today
        numTabs: 10,
      },
    }
    const { calculateMaxTabs } = require('../user-utils')
    expect(calculateMaxTabs(15, mockMaxDay)).toEqual({
      maxDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(),
        numTabs: 200,
      },
      recentDay: {
        date: moment.utc().toISOString(), // today
        numTabs: 15,
      },
    })
  })

  test('calculateMaxTabs for mission correctly only counts recent day tabs after a user joined the mission', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment.utc().toISOString(),
        numTabs: 0,
      },
      recentDay: {
        date: moment.utc().toISOString(), // not today
        numTabs: 0,
      },
    }
    const maxPossibleSquadTabs = 7
    const { calculateMaxTabs } = require('../user-utils')
    expect(calculateMaxTabs(15, mockMaxDay, maxPossibleSquadTabs)).toEqual({
      maxDay: {
        date: moment.utc().toISOString(),
        numTabs: 8,
      },
      recentDay: {
        date: moment.utc().toISOString(), // today
        numTabs: 8,
      },
    })
  })

  test('calculateTabStreak correctly updates current tab streak and longest tab streak', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(),
        numTabs: 10,
      },
      recentDay: {
        date: moment
          .utc()
          .subtract(1, 'days')
          .toISOString(), // not today
        numTabs: 10,
      },
    }
    const { calculateTabStreak } = require('../user-utils')
    const tabStreakObject = { currentTabStreak: 2, longestTabStreak: 2 }
    expect(calculateTabStreak(mockMaxDay, tabStreakObject)).toEqual({
      currentTabStreak: 3,
      longestTabStreak: 3,
    })
  })

  test('calculateTabStreak correctly ensure that current tab streak and longest tab streak are no less than 1', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(),
        numTabs: 10,
      },
      recentDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(), // not today
        numTabs: 10,
      },
    }
    const { calculateTabStreak } = require('../user-utils')
    const tabStreakObject = { currentTabStreak: 0, longestTabStreak: 0 }
    expect(calculateTabStreak(mockMaxDay, tabStreakObject)).toEqual({
      currentTabStreak: 1,
      longestTabStreak: 1,
    })
  })

  test('calculateTabStreak correctly updates only current tab streak', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(),
        numTabs: 10,
      },
      recentDay: {
        date: moment
          .utc()
          .subtract(1, 'days')
          .toISOString(), // yesterday
        numTabs: 10,
      },
    }
    const { calculateTabStreak } = require('../user-utils')
    const tabStreakObject = { currentTabStreak: 2, longestTabStreak: 4 }
    expect(calculateTabStreak(mockMaxDay, tabStreakObject)).toEqual({
      currentTabStreak: 3,
      longestTabStreak: 4,
    })
  })

  test('calculateTabStreak correctly resets current tab streak', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(),
        numTabs: 10,
      },
      recentDay: {
        date: moment
          .utc()
          .subtract(2, 'days')
          .toISOString(),
        numTabs: 10,
      },
    }
    const tabStreakObject = { currentTabStreak: 2, longestTabStreak: 4 }
    const { calculateTabStreak } = require('../user-utils')
    expect(calculateTabStreak(mockMaxDay, tabStreakObject)).toEqual({
      currentTabStreak: 1,
      longestTabStreak: 4,
    })
  })

  test('calculateTabStreak correctly doesnt change if same day', () => {
    const mockMaxDay = {
      maxDay: {
        date: moment
          .utc()
          .subtract(5, 'days')
          .toISOString(),
        numTabs: 10,
      },
      recentDay: {
        date: moment.utc().toISOString(),
        numTabs: 10,
      },
    }
    const { calculateTabStreak } = require('../user-utils')
    const tabStreakObject = { currentTabStreak: 2, longestTabStreak: 4 }
    expect(calculateTabStreak(mockMaxDay, tabStreakObject)).toEqual({
      currentTabStreak: 2,
      longestTabStreak: 4,
    })
  })
})
