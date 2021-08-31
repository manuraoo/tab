/* eslint-env jest */
import { verifyAndSendInvite, getUserInvites } from '../../invitedUsers/utils'
import inviteUserToMission from '../inviteUserToMission'
import { getMockUserContext, getMockUserInstance } from '../../test-utils'
import MissionModel from '../MissionModel'

jest.mock('../../invitedUsers/utils', () => ({
  verifyAndSendInvite: jest.fn(),
  sanitize: string => string,
  getUserInvites: jest.fn(),
}))
jest.mock('../../databaseClient')
jest.mock('../../globals/globals')
jest.mock('../MissionModel', () => ({
  get: jest.fn(),
  update: jest.fn(),
}))
const userContext = getMockUserContext()

afterEach(() => {
  jest.clearAllMocks()
})
const userId = userContext.id
const mockParams = [userContext, userId, ['test123', 'test124'], 'alec']
describe('invite users to mission', () => {
  it('it successfully emails and invites new users', async () => {
    expect.assertions(4)
    getUserInvites.mockReturnValueOnce([
      getMockUserInstance(),
      [{ user: 'test' }],
    ])
    verifyAndSendInvite.mockReturnValueOnce({ email: 'test123' })
    verifyAndSendInvite.mockReturnValueOnce({ email: 'test124' })
    MissionModel.get.mockReturnValueOnce({
      id: '123456789',
      squadName: 'TestSquad',
      created: '2017-07-19T03:05:12Z',
      started: '2017-07-19T03:05:12Z',
      tabGoal: 1000,
      acceptedSquadMembers: ['cL5KcFKHd9fEU5C9Vstj3g4JAc73', 'abcdefghijklmno'],
      pendingSquadMembersExisting: ['efghijklmnopqrs'],
      pendingSquadMembersEmailInvite: ['alec+897234@tabforacause.org'],
      rejectedSquadMembers: [],
    })
    const results = await inviteUserToMission(...mockParams)
    expect(verifyAndSendInvite).toHaveBeenCalledTimes(2)
    expect(results.successfulEmailAddresses.length).toEqual(2)
    expect(results.failedEmailAddresses.length).toEqual(0)
    expect(MissionModel.update).toHaveBeenCalledWith(expect.anything(), {
      id: '123456789',
      pendingSquadMembersEmailInvite: [
        'alec+897234@tabforacause.org',
        'test123',
        'test124',
      ],
      pendingSquadMembersExisting: ['efghijklmnopqrs'],
      rejectedSquadMembers: [],
    })
  })

  it('it seperates failed email creations from succesful email creations', async () => {
    expect.assertions(4)
    getUserInvites.mockReturnValueOnce([
      getMockUserInstance(),
      [{ user: 'test' }],
    ])
    verifyAndSendInvite.mockReturnValueOnce({ email: 'test123' })
    verifyAndSendInvite.mockReturnValueOnce({
      email: 'test124',
      error: 'user already exists',
    })
    MissionModel.get.mockReturnValueOnce({
      id: '123456789',
      squadName: 'TestSquad',
      created: '2017-07-19T03:05:12Z',
      started: '2017-07-19T03:05:12Z',
      tabGoal: 1000,
      acceptedSquadMembers: ['cL5KcFKHd9fEU5C9Vstj3g4JAc73', 'abcdefghijklmno'],
      pendingSquadMembersExisting: ['efghijklmnopqrs'],
      pendingSquadMembersEmailInvite: ['alec+897234@tabforacause.org'],
      rejectedSquadMembers: [],
    })
    const results = await inviteUserToMission(...mockParams)
    expect(verifyAndSendInvite).toHaveBeenCalledTimes(2)
    expect(results.successfulEmailAddresses.length).toEqual(1)
    expect(results.failedEmailAddresses.length).toEqual(1)
    expect(MissionModel.update).toHaveBeenCalledWith(expect.anything(), {
      id: '123456789',
      pendingSquadMembersEmailInvite: [
        'alec+897234@tabforacause.org',
        'test123',
      ],
      pendingSquadMembersExisting: ['efghijklmnopqrs'],
      rejectedSquadMembers: [],
    })
  })

  it('it throws an error if user tries to create more than 50 invites in 24 hours', async () => {
    expect.assertions(1)
    getUserInvites.mockReturnValueOnce([
      getMockUserInstance(),
      [{ user: 'test' }],
    ])
    verifyAndSendInvite.mockReturnValueOnce({ email: 'test123' })
    verifyAndSendInvite.mockReturnValueOnce({
      email: 'test124',
      error: 'user already exists',
    })
    const randomStringArray = []
    function makeid(length) {
      const result = []
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const charactersLength = characters.length
      for (let i = 0; i < length; i += 1) {
        result.push(
          characters.charAt(Math.floor(Math.random() * charactersLength))
        )
      }
      return result.join('')
    }
    for (let i = 0; i < 61; i += 1) {
      randomStringArray.push(makeid(9))
    }
    expect(
      inviteUserToMission(userContext, userId, randomStringArray, 'alec')
    ).rejects.toThrow('user is trying to invite too many people in 24 hours')
  })
})
