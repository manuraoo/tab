/* eslint-env jest */

import { cloneDeep } from 'lodash/lang'

import UserModel from '../UserModel'
import createUser from '../createUser'
import logReferralData from '../../referrals/logReferralData'
import getUserByUsername from '../getUserByUsername'
import rewardReferringUser from '../rewardReferringUser'
import {
  addTimestampFieldsToItem,
  DatabaseOperation,
  getMockUserContext,
  getMockUserInfo,
  getMockUserInstance,
  mockDate,
  setMockDBResponse
} from '../../test-utils'

jest.mock('../../databaseClient')

jest.mock('../../referrals/logReferralData')
jest.mock('../rewardReferringUser')
jest.mock('../getUserByUsername')

const userContext = getMockUserContext()

beforeAll(() => {
  mockDate.on()
})

afterAll(() => {
  mockDate.off()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('createUser', () => {
  it('works as expected without referralData', async () => {
    const createMethod = jest.spyOn(UserModel, 'create')
    const userInfo = getMockUserInfo()
    const referralData = null
    await createUser(userContext, userInfo.id,
      userInfo.username, userInfo.email, referralData)

    const expectedCreateItem = addTimestampFieldsToItem(userInfo)
    expect(createMethod)
      .toHaveBeenCalledWith(userContext, expectedCreateItem)
    expect(logReferralData).not.toHaveBeenCalled()
    expect(rewardReferringUser).not.toHaveBeenCalled()
  })

  it('logs referral data and rewards referring user', async () => {
    const createMethod = jest.spyOn(UserModel, 'create')
    const userInfo = getMockUserInfo()
    const referralData = {
      referringUser: 'FriendOfMine'
    }

    // Mock fetching the referring user.
    const referringUserId = 'ppooiiuu-151a-4a9a-9289-06906670fd4e'
    getUserByUsername.mockImplementationOnce(() => {
      return {
        id: referringUserId
      }
    })

    await createUser(userContext, userInfo.id,
      userInfo.username, userInfo.email, referralData)

    const expectedCreateItem = addTimestampFieldsToItem(userInfo)
    expect(createMethod)
      .toHaveBeenCalledWith(userContext, expectedCreateItem)
    expect(logReferralData)
      .toHaveBeenCalledWith(userContext, userInfo.id, referringUserId)
    expect(rewardReferringUser)
      .toHaveBeenCalledWith(referringUserId)
  })

  it('works when referring user does not exist', async () => {
    const createMethod = jest.spyOn(UserModel, 'create')
    const userInfo = getMockUserInfo()
    const referralData = {
      referringUser: 'FriendOfMine'
    }

    // Mock fetching the referring user.
    getUserByUsername.mockImplementationOnce(() => {
      return null
    })

    await createUser(userContext, userInfo.id,
      userInfo.username, userInfo.email, referralData)

    const expectedCreateItem = addTimestampFieldsToItem(userInfo)
    expect(createMethod)
      .toHaveBeenCalledWith(userContext, expectedCreateItem)
    expect(logReferralData).not.toHaveBeenCalled()
    expect(rewardReferringUser).not.toHaveBeenCalled()
  })

  it('calls the database as expected', async () => {
    const userInfo = getMockUserInfo()
    const referralData = null
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.CREATE,
      {
        Attributes: {}
      }
    )
    const expectedUser = getMockUserInstance(userInfo)
    const expectedParamsUser = cloneDeep(expectedUser)
    delete expectedParamsUser.backgroundImage.imageURL
    const expectedParams = {
      Item: expectedParamsUser,
      TableName: UserModel.tableName
    }
    const createdItem = await createUser(userContext, userInfo.id,
      userInfo.username, userInfo.email, referralData)
    const dbParams = dbQueryMock.mock.calls[0][0]
    expect(dbParams).toEqual(expectedParams)
    expect(createdItem).toEqual(expectedUser)
  })
})
