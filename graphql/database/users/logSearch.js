import moment from 'moment'
import UserModel from './UserModel'
import UserSearchLogModel from './UserSearchLogModel'
import addVc from './addVc'
import checkSearchRateLimit from './checkSearchRateLimit'
import { getTodaySearchCount } from './user-utils'

/**
 * Log a user's search event and change related stats.
 * @param {object} userContext - The user authorizer object.
 * @param {string} userId - The user id.
 * @return {Promise<User>} A promise that resolves into a User instance.
 */
const logSearch = async (userContext, userId, searchData = {}) => {
  let user
  try {
    user = await UserModel.get(userContext, userId)
  } catch (e) {
    throw e
  }

  // Update the user's counter for max searches in a day.
  // If this is the user's first search today, reset the counter
  // for the user's "current day" search count.
  // If today is also the day of all time max searches,
  // update the max searches day value.
  const todaySearchCount = getTodaySearchCount(user) + 1
  const isTodayMax = todaySearchCount >= user.maxSearchesDay.maxDay.numSearches
  const maxSearchesDayVal = {
    maxDay: {
      date: isTodayMax
        ? moment.utc().toISOString()
        : user.maxSearchesDay.maxDay.date,
      numSearches: isTodayMax
        ? todaySearchCount
        : user.maxSearchesDay.maxDay.numSearches,
    },
    recentDay: {
      date: moment.utc().toISOString(),
      numSearches: todaySearchCount,
    },
  }

  try {
    // Limit how many hearts from searches a user can earn, to
    // prevent abuse.
    const { limitReached } = await checkSearchRateLimit(userContext, userId)
    if (!limitReached) {
      if (user.searchEngine === 'Yahoo' && user.yahooPaidSearchRewardOptIn) {
        user = await addVc(userContext, userId, 1)
      }
    }

    // Increment the user's search count.
    user = await UserModel.update(userContext, {
      id: userId,
      searches: { $add: 1 },
      lastSearchTimestamp: moment.utc().toISOString(),
      maxSearchesDay: maxSearchesDayVal,
    })

    // Log the search for analytics.
    const validSearchSources = ['self', 'chrome', 'ff', 'tab']
    const source =
      searchData.source && validSearchSources.indexOf(searchData.source) > -1
        ? searchData.source
        : null
    await UserSearchLogModel.create(userContext, {
      userId,
      timestamp: moment.utc().toISOString(),
      ...(source && { source }),
    })
  } catch (e) {
    throw e
  }
  return user
}

export default logSearch
