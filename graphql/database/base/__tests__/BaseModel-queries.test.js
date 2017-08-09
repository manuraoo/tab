/* eslint-env jest */

import moment from 'moment'

import ExampleModel, { fixturesA } from '../test-utils/ExampleModel'
import ExampleModelRangeKey, {
  fixturesRangeKeyA
} from '../test-utils/ExampleModelRangeKey'
import {
  DatabaseOperation,
  getMockUserObj,
  mockDate,
  setMockDBResponse,
  setModelPermissions
} from '../../test-utils'
import {
  UnauthorizedQueryException
} from '../../../utils/exceptions'

jest.mock('../../databaseClient')

const user = getMockUserObj()

function removeCreatedAndUpdatedFields (item) {
  const newItem = Object.assign({}, item)
  delete newItem.created
  delete newItem.updated
  return newItem
}

beforeAll(() => {
  mockDate.on()
})

afterAll(() => {
  mockDate.off()
})

afterEach(() => {
  jest.resetAllMocks()

  // For some reason, jest.resetModules is failing with
  // ExampleModel (even when using CommonJS requires), so just
  // reset permissions manually.
  setModelPermissions(ExampleModel, {
    get: () => false,
    getAll: () => false,
    update: () => false,
    create: () => false
  })
})

describe('BaseModel queries', () => {
  it('correctly fetches with `getAll` method', async () => {
    setModelPermissions(ExampleModel, {
      getAll: () => true
    })

    // Set mock response from DB client.
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.GET_ALL,
      {
        Items: fixturesA
      }
    )
    const expectedDBParams = {
      TableName: ExampleModel.tableName
    }
    const response = await ExampleModel.getAll(user)
    expect(dbQueryMock.mock.calls[0][0]).toEqual(expectedDBParams)
    expect(response.length).toBe(fixturesA.length)
    for (var index in response) {
      expect(response[index]).toEqual(fixturesA[index])
    }
  })

  it('fails with unauthorized `getAll`', async () => {
    expect.assertions(1)
    setModelPermissions(ExampleModel, {
      getAll: () => false
    })
    return expect(ExampleModel.getAll(user))
      .rejects.toEqual(new UnauthorizedQueryException())
  })

  it('correctly fetches with `get` method for a model with no range key', async () => {
    setModelPermissions(ExampleModel, {
      get: () => true
    })

    // Set mock response from DB client.
    const itemToGet = Object.assign({}, fixturesA[0])
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.GET,
      {
        Item: itemToGet
      }
    )
    const expectedDBParams = {
      TableName: ExampleModel.tableName,
      Key: {
        id: itemToGet.id
      }
    }
    const response = await ExampleModel.get(user, itemToGet.id)
    expect(dbQueryMock.mock.calls[0][0]).toEqual(expectedDBParams)
    expect(response).toEqual(itemToGet)
  })

  it('correctly handles a `get` that returns no item', async () => {
    setModelPermissions(ExampleModel, {
      get: () => true
    })

    // Set mock response from DB client.
    const itemToGet = Object.assign({}, fixturesA[0])
    setMockDBResponse(
      DatabaseOperation.GET,
      {
        Item: null
      }
    )
    const response = await ExampleModel.get(user, itemToGet.id)
    expect(response).toEqual(null)
  })

  it('correctly uses `get` method for a model with a range key', async () => {
    setModelPermissions(ExampleModelRangeKey, {
      get: () => true
    })

    // Set mock response from DB client.
    const itemToGet = Object.assign({}, fixturesRangeKeyA[0])
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.GET,
      {
        Item: itemToGet
      }
    )
    const expectedDBParams = {
      TableName: ExampleModelRangeKey.tableName,
      Key: {
        id: itemToGet.id,
        age: itemToGet.age
      }
    }
    const response = await ExampleModelRangeKey.get(user, itemToGet.id, itemToGet.age)
    expect(dbQueryMock.mock.calls[0][0]).toEqual(expectedDBParams)
    expect(response).toEqual(itemToGet)
  })

  it('fails with unauthorized `get`', async () => {
    expect.assertions(1)
    setModelPermissions(ExampleModel, {
      get: () => false
    })
    const itemToGet = Object.assign({}, fixturesA[0])
    return expect(ExampleModel.get(user, itemToGet.id))
      .rejects.toEqual(new UnauthorizedQueryException())
  })

  it('correctly creates item', async () => {
    setModelPermissions(ExampleModel, {
      create: () => true
    })

    // Set mock response from DB client.
    const item = Object.assign({}, fixturesA[0])
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.CREATE,
      {
        // https://docs.aws.amazon.com/cli/latest/reference/dynamodb/put-item.html#output
        Attributes: {}
      }
    )

    // 'created' and 'updated' field should be automatically update.
    const itemToCreate = removeCreatedAndUpdatedFields(item)
    const createdItem = await ExampleModel.create(user, itemToCreate)

    // Verify form of DB params.
    const dbParams = dbQueryMock.mock.calls[0][0]
    expect(dbParams.TableName).toEqual(ExampleModel.tableName)
    expect(dbParams.Item.id).toEqual(item.id)
    // It should set the 'created' and 'updated' fields.
    expect(dbParams.Item.created).toBe(moment.utc().toISOString())
    expect(dbParams.Item.updated).toBe(moment.utc().toISOString())

    // Verify form of created object.
    expect(createdItem.id).toEqual(item.id)
    expect(createdItem.created).toBe(moment.utc().toISOString())
    expect(createdItem.updated).toBe(moment.utc().toISOString())
  })

  it('correctly creates item with default fields', async () => {
    setModelPermissions(ExampleModel, {
      create: () => true
    })

    // Set mock response from DB client.
    const itemToCreate = {}
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.CREATE,
      {
        Attributes: {}
      }
    )
    const createdItem = await ExampleModel.create(user, itemToCreate)

    // Verify form of DB params.
    const dbParams = dbQueryMock.mock.calls[0][0]
    expect(dbParams.TableName).toEqual(ExampleModel.tableName)
    expect(dbParams.Item.id).toBeDefined()
    expect(dbParams.Item.name).toEqual(ExampleModel.fieldDefaults.name)
    // It should set the 'created' and 'updated' fields.
    expect(dbParams.Item.created).toBe(moment.utc().toISOString())
    expect(dbParams.Item.updated).toBe(moment.utc().toISOString())

    // Verify form of created object.
    expect(createdItem.id).toBeDefined()
    expect(createdItem.created).toBe(moment.utc().toISOString())
    expect(createdItem.updated).toBe(moment.utc().toISOString())
  })

  it('fails with unauthorized `create`', async () => {
    expect.assertions(1)
    setModelPermissions(ExampleModel, {
      create: () => false
    })
    const itemToCreate = Object.assign({}, fixturesA[0])
    return expect(ExampleModel.create(user, itemToCreate))
      .rejects.toEqual(new UnauthorizedQueryException())
  })

  it('correctly updates item', async () => {
    setModelPermissions(ExampleModel, {
      update: () => true
    })

    // Set mock response from DB client.
    const item = Object.assign({}, fixturesA[0])
    const expectedReturn = Object.assign({}, item, {
      updated: moment.utc().toISOString()
    })
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.UPDATE,
      {
        Attributes: expectedReturn
      }
    )

    // 'updated' field should be automatically update.
    const itemToUpdate = removeCreatedAndUpdatedFields(item)
    const updatedItem = await ExampleModel.update(user, itemToUpdate)

    // Verify form of DB params.
    // {
    //   TableName: 'ExamplesTable',
    //   Key: { id: 'ab5082cc-151a-4a9a-9289-06906670fd4e' },
    //   ReturnValues: 'ALL_NEW',
    //   ExpressionAttributeValues: { ':name': 'Thing A', ':updated': '2017-07-28T21:11:12.215Z' },
    //   ExpressionAttributeNames: { '#name': 'name', '#updated': 'updated' },
    //   UpdateExpression: 'SET #name = :name, #updated = :updated'
    // }
    const dbParams = dbQueryMock.mock.calls[0][0]
    expect(dbParams.TableName).toEqual(ExampleModel.tableName)
    expect(dbParams.Key.id).toEqual(item.id)
    expect(dbParams.ReturnValues).toEqual('ALL_NEW')
    expect(dbParams.ExpressionAttributeValues[':name']).toBe(item.name)
    // It should set the 'updated' field.
    expect(dbParams.ExpressionAttributeValues[':updated'])
      .toBe(moment.utc().toISOString())
    expect(dbParams.UpdateExpression).toBe('SET #name = :name, #updated = :updated')

    // Verify returned object.
    expect(updatedItem).toEqual(expectedReturn)
  })

  it('correctly updates item with a range key', async () => {
    setModelPermissions(ExampleModelRangeKey, {
      update: () => true
    })

    // Set mock response from DB client.
    const item = Object.assign({}, fixturesRangeKeyA[0])
    const expectedReturn = Object.assign({}, item, {
      updated: moment.utc().toISOString()
    })
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.UPDATE,
      {
        Attributes: expectedReturn
      }
    )

    const itemToUpdate = removeCreatedAndUpdatedFields(item)
    const updatedItem = await ExampleModelRangeKey.update(user, itemToUpdate)

    // Verify form of DB params.
    const dbParams = dbQueryMock.mock.calls[0][0]
    expect(dbParams.TableName).toEqual(ExampleModelRangeKey.tableName)
    expect(dbParams.Key.id).toEqual(item.id)
    expect(dbParams.Key.age).toBeDefined()
    expect(dbParams.Key.age).toEqual(item.age)
    expect(dbParams.ExpressionAttributeValues[':name']).toBe(item.name)
    // It should set the 'updated' field.
    expect(dbParams.ExpressionAttributeValues[':updated'])
      .toBe(moment.utc().toISOString())
    expect(dbParams.UpdateExpression).toBe('SET #name = :name, #updated = :updated')

    // Verify returned object.
    expect(updatedItem).toEqual(expectedReturn)
  })

  it('fails with unauthorized `update`', async () => {
    expect.assertions(1)
    setModelPermissions(ExampleModel, {
      update: () => false
    })
    const itemToUpdate = Object.assign({}, fixturesA[0])
    return expect(ExampleModel.update(user, itemToUpdate))
      .rejects.toEqual(new UnauthorizedQueryException())
  })

  it('correctly uses `query` method', async () => {
    setModelPermissions(ExampleModelRangeKey, {
      get: () => true
    })

    // Set mock response from DB client.
    const itemsToGet = fixturesRangeKeyA
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.QUERY,
      {
        Items: itemsToGet
      }
    )
    const response = await ExampleModelRangeKey
      .query(user, itemsToGet[0].id)
      .execute()

    // Verify DB params.
    const dbParams = dbQueryMock.mock.calls[0][0]
    expect(dbParams.TableName).toEqual(ExampleModelRangeKey.tableName)
    expect(dbParams.ExpressionAttributeValues).toEqual({
      ':id': itemsToGet[0].id
    })
    expect(dbParams.KeyConditionExpression).toEqual('(#id = :id)')

    // Verify response.
    expect(response).toEqual(itemsToGet)
  })

  it('correctly uses `query` method with filters', async () => {
    setModelPermissions(ExampleModelRangeKey, {
      get: () => true
    })

    // Set mock response from DB client.
    const itemsToGet = fixturesRangeKeyA
    const dbQueryMock = setMockDBResponse(
      DatabaseOperation.QUERY,
      {
        Items: itemsToGet
      }
    )
    const response = await ExampleModelRangeKey
      .query(user, itemsToGet[0].id)
      .where('age').gt(30)
      .execute()

    // Verify DB params.
    const dbParams = dbQueryMock.mock.calls[0][0]
    expect(dbParams.TableName).toEqual(ExampleModelRangeKey.tableName)
    expect(dbParams.ExpressionAttributeValues).toEqual({
      ':id': itemsToGet[0].id,
      ':age': 30
    })
    expect(dbParams.KeyConditionExpression).toEqual(
      '(#age > :age) AND (#id = :id)')

    // Verify response.
    expect(response).toEqual(itemsToGet)
  })

  it('fails with unauthorized `query`', async () => {
    expect.assertions(1)
    setModelPermissions(ExampleModelRangeKey, {
      get: () => false
    })
    const itemsToGet = fixturesRangeKeyA
    return expect(
      ExampleModelRangeKey
        .query(user, itemsToGet[0].id)
        .execute()
      ).rejects.toEqual(new UnauthorizedQueryException())
  })
})
