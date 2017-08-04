
import moment from 'moment'

import BaseModel from '../base/BaseModel'
import types from '../fieldTypes'
import tableNames from '../tables'
import {
  USER,
  USER_BACKGROUND_OPTION_COLOR,
  USER_BACKGROUND_OPTION_CUSTOM,
  USER_BACKGROUND_OPTION_DAILY,
  USER_BACKGROUND_OPTION_PHOTO,
  USER_REFERRAL_VC_REWARD
} from '../constants'
import {
  getPermissionsOverride,
  permissionAuthorizers
} from '../../utils/authorization-helpers'
import {
  getBackgroundImage,
  getRandomImage
} from '../backgroundImages/backgroundImage'
import { logReferralData } from '../referrals/referralData'

/*
 * Represents a Charity.
 * @extends BaseModel
 */
class User extends BaseModel {
  static get name () {
    return USER
  }

  static get hashKey () {
    return 'id'
  }

  static get indexes () {
    return [{
      hashKey: 'username',
      name: 'UsersByUsername',
      type: 'global'
    }]
  }

  static get tableName () {
    return tableNames.users
  }

  static get schema () {
    const self = this
    return {
      id: types.uuid(),
      email: types.string().email().required(),
      username: types.string().required(),
      vcCurrent: types.number().integer().default(self.fieldDefaults.vcCurrent),
      vcAllTime: types.number().integer().default(self.fieldDefaults.vcAllTime),
      level: types.number().integer().default(self.fieldDefaults.level),
      heartsUntilNextLevel: types.number().integer(),
      backgroundImage: types.object().default(self.fieldDefaults.backgroundImage),
      backgroundOption: types.string().default(self.fieldDefaults.backgroundOption),
      backgroundColor: types.string(),
      customImage: types.string(),
      activeWidget: types.string(),
      lastTabTimestamp: types.date().iso()
    }
  }

  static get fieldDefaults () {
    return {
      vcCurrent: 0,
      vcAllTime: 0,
      level: 1,
      // This value needs to match the hearts required for level 2
      // in the database.
      heartsUntilNextLevel: 5,
      backgroundImage: {
        id: 'fb5082cc-151a-4a9a-9289-06906670fd4e',
        name: 'Mountain Lake',
        fileName: 'lake.jpg',
        timestamp: moment.utc().format()
      },
      backgroundOption: USER_BACKGROUND_OPTION_PHOTO
    }
  }

  static get permissions () {
    return {
      get: permissionAuthorizers.usernameOrUserIdMatchesHashKey,
      getAll: () => false,
      update: permissionAuthorizers.usernameOrUserIdMatchesHashKey,
      // To create a new user, the created item must have the same
      // email, username, and user ID as the authorized user.
      create: (userContext, hashKey, rangeKey, item) => {
        return (
          userContext.id === item.id &&
          userContext.email === item.email &&
          userContext.username === item.username
        )
      }
    }
  }

  /**
   * Fetch the user by username.
   * @param {object} userContext - The user authorizer object.
   * @param {string} username - The user's username.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async getUserByUsername (userContext, username) {
    return this.query(userContext, username)
      .usingIndex('UsersByUsername')
      .execute()
  }

  /**
   * Creates a new user.
   * @param {object} userContext - The user authorizer object.
   * @param {object} user - The user info.
   * @param {object} referralData - Referral data.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async createUser (userContext, userId, username,
      email, referralData) {
    const userInfo = {
      id: userId,
      username: username,
      email: email
    }
    const createdUser = await User.create(userContext, userInfo)
      .catch((err) => err)
    if (referralData) {
      const referringUserUsername = referralData.referringUser
      const referringUser = await this.getUserByUsername(referringUserUsername)
      if (referringUser) {
        // FIXME: make this override permissions.
        await logReferralData(userInfo.id, referringUser.id)
        await this.rewardReferringUser(referringUser.id)
      }
    }
    return createdUser
  }

  /**
   * Set user's background image.
   * @param {object} userContext - The user authorizer object.
   * @param {string} userId - The user id.
   * @param {string} imageId - The image id.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async setBackgroundImage (userContext, userId, imageId, mode) {
    const image = await getBackgroundImage(imageId)
    image.timestamp = moment.utc().format()
    if (!mode) {
      mode = USER_BACKGROUND_OPTION_PHOTO
    }
    const userInstance = await this.update(userContext, {
      id: userId,
      backgroundImage: image,
      backgroundOption: mode
    })
    return userInstance
  }

  /**
   * Set user's background image from a custom image URL.
   * @param {object} userContext - The user authorizer object.
   * @param {string} userId - The user id.
   * @param {string} imageUrl - The url for the image to use as background.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async setBackgroundImageFromCustomURL (userContext, userId, imageURL) {
    const userInstance = await this.update(userContext, {
      id: userId,
      customImage: imageURL,
      backgroundOption: USER_BACKGROUND_OPTION_CUSTOM
    })
    return userInstance
  }

  /**
   * Set user's background color.
   * @param {object} userContext - The user authorizer object.
   * @param {string} userId - The user id.
   * @param {string} color - The background color.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async setBackgroundColor (userContext, userId, color) {
    const userInstance = await this.update(userContext, {
      id: userId,
      backgroundColor: color,
      backgroundOption: USER_BACKGROUND_OPTION_COLOR
    })
    return userInstance
  }

  /**
   * Set user's background image to change daily.
   * @param {object} userContext - The user authorizer object.
   * @param {string} userId - The user id.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async setBackgroundImageDaily (userContext, userId) {
    const image = await getRandomImage()
    image.timestamp = moment.utc().format()
    const userInstance = await this.update(userContext, {
      id: userId,
      backgroundImage: image,
      backgroundOption: USER_BACKGROUND_OPTION_DAILY
    })
    return userInstance
  }

  /**
   * Set the user's active widget.
   * @param {object} userContext - The user authorizer object.
   * @param {string} userId - The user id.
   * @param {string} widgetId - The widget Id.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async setActiveWidget (userContext, userId, widgetId) {
    const userInstance = await this.update(userContext, {
      id: userId,
      activeWidget: widgetId
    })
    return userInstance
  }

  /**
   * Adds the specified virtual currency to the user's vc amount.
   * Added `vc` can be negative.
   * @param {object} userContext - The user authorizer object.
   * @param {string} id - The user id.
   * @param {integer} vc - The amount of virtual currency to add to the
   *   user's balance.
   * @return {Promise<User>}  A promise that resolves into a User instance.
   */
  static async addVc (userContext, userId, vc = 0) {
    const user = await this.update(userContext, {
      id: userId,
      vcCurrent: {$add: vc},
      vcAllTime: {$add: vc},
      heartsUntilNextLevel: {$add: -vc},
      lastTabTimestamp: moment.utc().format()
    })
    // TODO: check if user gained a level.
    return user
  }

  static async rewardReferringUser (referringUserId) {
    const permissionsOverride = getPermissionsOverride()
    await this.addVc(permissionsOverride, referringUserId,
      USER_REFERRAL_VC_REWARD)
  }
}

User.register()

export default User
