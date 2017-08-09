
import moment from 'moment'
import { has } from 'lodash/object'

import dynogels from './dynogels-promisified'
import types from '../fieldTypes'
import {
  NotImplementedException,
  UnauthorizedQueryException
} from '../../utils/exceptions'
import dbClient from '../databaseClient'
import { isValidPermissionsOverride } from '../../utils/authorization-helpers'

dynogels.documentClient(dbClient)

class BaseModel {
  constructor (obj) {
    if (!obj || typeof obj !== 'object') {
      return
    }
    const fieldNames = [].concat(Object.keys(this.constructor.schema),
      ['created', 'updated'])
    fieldNames.forEach((fieldName) => {
      // Set properties for each field on the model.
      // Set the value to the value passed in `obj` if one exists.
      // If not passed a value in `obj`, use the default value
      // defined in the `fieldDefaults` method, if it exists;
      // otherwise, set the property to null.
      if (has(obj, fieldName)) {
        this[fieldName] = obj[fieldName]
      } else if (has(this.constructor.fieldDefaults, fieldName)) {
        this[fieldName] = this.constructor.fieldDefaults[fieldName]
      } else {
        this[fieldName] = null
      }
    })
  }

  /**
   * The name of the model.
   * You are required to override this function on the child class.
   * @return {string} The name of the model.
   */
  static get name () {
    throw new NotImplementedException()
  }

  /**
   * The name of the database table.
   * You are required to override this function on the child class.
   * @return {string} The name of the database table.
   */
  static get tableName () {
    throw new NotImplementedException()
  }

  /**
   * The name of the hashKey for the DynamoDB table.
   * You are required to override this function on the child class.
   * @return {string} The name of the hashKey for the DynamoDB table.
   */
  static get hashKey () {
    throw new NotImplementedException()
  }

  /**
   * The name of the range key (if it exists) for the DynamoDB table.
   * @return {string} The name of the hashKey for the DynamoDB table.
   */
  static get rangeKey () {
    return null
  }

  /**
   * Any secondary indexes on the model.
   * See:
   *   https://github.com/clarkie/dynogels#global-indexes
   *   https://github.com/clarkie/dynogels#local-secondary-indexes
   * @return {object} The name of the hashKey for the DynamoDB table.
   * @return {array<object>} indexes<index> - A list of index objects.
   * @return {string} index.hashKey - The hash key.
   * @return {string} index.rangeKey - The range key.
   * @return {string} index.name - The name of the index.
   * @return {string} index.type - Either "global" or "local".
   */
  static get indexes () {
    return null
  }

  /**
   * The table schema, used in dynogels.
   * You are required to override this function on the child class.
   * @return {object} The table schema.
   */
  static get schema () {
    throw new NotImplementedException()
  }

  /**
   * Default values for the fields in schema.
   * @return {object} A map of default values
   */
  static get fieldDefaults () {
    return {}
  }

  /**
   * The permissions object, used to check authorization for database
   * operations. By default, no operations are authorized.
   * @return {object} The permissions object, with a key for each
   *   operation name. Each property value is a function that receives
   *   a userContext object, item hashKey, and item rangeKey, and must return
   *   a boolean for whether the query is authorized.
   */
  static get permissions () {
    return {
      get: (userContext, hashKeyValue, rangeKeyValue) => false,
      getAll: () => false,
      update: (userContext, hashKeyValue, rangeKeyValue) => false,
      create: (userContext, hashKeyValue) => false
    }
  }

  /**
   * Register the model with dynogels. This must be called prior to
   * using any methods that query the database.
   * @return {undefined}
   */
  static register () {
    // console.log(`Registering model ${this.name} to table ${this.tableName}.`)

    // Add two ISO timestamps, 'created' and 'updated', to
    // the item's fields.
    const schema = Object.assign(this.schema, {
      created: types.string().isoDate(),
      updated: types.string().isoDate()
    })

    const options = {
      hashKey: this.hashKey,
      tableName: this.tableName,

      // Handle timestamps ourselves, not through dynogels.
      timestamps: false,

      schema: schema
    }
    if (this.rangeKey) {
      options['rangeKey'] = this.rangeKey
    }

    // Add any secondary indexes.
    // https://github.com/clarkie/dynogels#global-indexes
    if (this.indexes) {
      options.indexes = this.indexes
    }

    this.dynogelsModel = dynogels.define(this.name, options)
  }

  static async get (userContext, hashKey, rangeKey, options) {
    const self = this
    let keys = [hashKey]
    if (rangeKey) {
      keys.push(rangeKey)
    }
    // console.log(`Getting obj with hashKey ${hashKey} from table ${this.tableName}.`)
    if (!this.isQueryAuthorized(userContext, 'get', hashKey, rangeKey)) {
      return Promise.reject(new UnauthorizedQueryException())
    }
    return this.dynogelsModel.getAsync(...keys)
      .then(data => self.deserialize(data))
      .catch(err => {
        console.log(err)
        return err
      })
  }

  static async getAll (userContext) {
    // console.log(`Getting all objs in table ${this.tableName}.`)
    const self = this
    if (!this.isQueryAuthorized(userContext, 'getAll')) {
      return Promise.reject(new UnauthorizedQueryException())
    }
    return this.dynogelsModel.scan().execAsync()
      .then(data => self.deserialize(data.Items))
      .catch(err => {
        console.log(err)
        return err
      })
  }

  static query (userContext, hashKey) {
    // console.log(`Querying hashKey ${hashKey} on table ${this.tableName}.`)
    if (!this.isQueryAuthorized(userContext, 'get', hashKey)) {
      // Raise the permissions error on query execution.
      const queryObj = this.dynogelsModel.query(hashKey)
      const execErr = () => Promise.reject(new UnauthorizedQueryException())
      queryObj.execute = execErr
      queryObj.exec = execErr
      queryObj.execAsync = execErr
      return queryObj
    }

    // Return a dynogels chainable query, but use our own
    // `exec` function so we can deserialize the response.
    // Execute the query by calling `.execute()`.
    const queryObj = this.dynogelsModel.query(hashKey)
    queryObj.execute = async () => this._execAsync(queryObj)
    return queryObj
  }

  static async _execAsync (queryObj) {
    const self = this
    return queryObj.execAsync()
      .then(data => self.deserialize(data.Items))
      .catch(err => {
        console.log(err)
        return err
      })
  }

  static async create (userContext, item) {
    // console.log(`Creating item in ${this.tableName}: ${JSON.stringify(item, null, 2)}`)
    const self = this
    const hashKey = item[this.hashKey]

    // Add 'created' and 'updated' fields.
    item.created = moment.utc().toISOString()
    item.updated = moment.utc().toISOString()

    if (!this.isQueryAuthorized(userContext, 'create', hashKey, null, item)) {
      return Promise.reject(new UnauthorizedQueryException())
    }
    return this.dynogelsModel.createAsync(item)
      .then(data => self.deserialize(data))
      .catch(err => {
        console.log(err)
        return err
      })
  }

  static async update (userContext, item) {
    // console.log(`Updating item in ${this.tableName}: ${JSON.stringify(item, null, 2)}`)
    const self = this
    const hashKey = item[this.hashKey]
    const rangeKey = item[this.rangeKey]

    // Update 'updated' field.
    item.updated = moment.utc().toISOString()

    if (!this.isQueryAuthorized(userContext, 'update', hashKey, rangeKey, item)) {
      return Promise.reject(new UnauthorizedQueryException())
    }
    return this.dynogelsModel.updateAsync(item, { ReturnValues: 'ALL_NEW' })
      .then(data => self.deserialize(data))
      .catch(err => {
        console.log(err)
        return err
      })
  }

  /**
   * Return a modified object or list of object from the
   * database item or items.
   * @param {Object || Object[]} obj - The database object or list of objects.
   * @return {Object | Object[]} An instance of `this`, with the attributes
   *   of `obj` and possibly some additional default attributes.
  */
  static deserialize (data) {
    const deserializeObj = (item) => {
      // Item may be null.
      if (!item) {
        return null
      }

      // Create an instance of the model class so that we can use
      // the class type in `nodeDefinitions` in schema.
      const Cls = this
      return new Cls(item.attrs)
    }

    var result
    if (data instanceof Array) {
      result = []
      for (var index in data) {
        result.push(deserializeObj(data[index]))
      }
    } else {
      result = deserializeObj(data)
    }
    return result
  }

  /**
   * Determine whether the userContext is authorized to make a particular
   * database query.
   * @param {obj} userContext - The user object passed as context
   * @param {string} operation - The operation type (e.g. "get" or "update")
   * @param {string} hashKeyValue - The value of the item hashKey in the query
   * @param {string} rangeKeyValue - The value of the item rangeKey in the query
   * @param {object} item - An object of attributes to be updated or created
   * @return {boolean} Whether the userContext is authorized.
   */
  static isQueryAuthorized (userContext, operation, hashKeyValue = null,
    rangeKeyValue = null, item = null) {
    // Check if the DB call has an authorization override
    // that ignores the user-level permissions.
    if (isValidPermissionsOverride(userContext)) {
      return true
    }

    // If the userContext is null or not an object, reject.
    if (!userContext || typeof userContext !== 'object') {
      return false
    }

    const validOperations = [
      'get',
      'getAll',
      'update',
      'create'
    ]
    if (validOperations.indexOf(operation) === -1) {
      return false
    }

    // Get the permissions from the model class. If no permissions are
    // defined, do not allow any access.
    const permissions = this.permissions
    if (!permissions) {
      return false
    }

    // Get the authorizer function from the model class for this operation.
    // If the function does not exist, do not allow any access.
    const authorizerFunction = permissions[operation]
    if (!authorizerFunction || !(typeof authorizerFunction === 'function')) {
      return false
    }

    // If the authorizer function returns `true`, the query is authorized.
    var isAuthorized = false
    try {
      isAuthorized = authorizerFunction(userContext, hashKeyValue, rangeKeyValue, item) === true
    } catch (err) {
      isAuthorized = false
      console.log(err)
    }
    return isAuthorized
  }
}

export default BaseModel
