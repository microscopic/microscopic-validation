'use strict'

class ValidationPlugin {
  static validate (request, next) {
    const methodDefinition = request._method.definition

    const params = request.params
    const paramsDefinition = methodDefinition.params

    if (!params || !paramsDefinition) {
      return next()
    }

    const result = _validate(params, paramsDefinition)

    if (Object.keys(result).length) {
      const error = new Error('Validation Error')
      error.data = result

      return next(error)
    }

    next()
  }

  static register (service) {
    service.ext('onPreMethod', ValidationPlugin.validate)
  }
}

function _validate (obj, schema) {
  const result = {}

  for (const field in schema) {
    const value = obj[ field ]
    let fieldSchema = schema[ field ]

    if (_isObject(fieldSchema)) {
      result[ field ] = _validate(value, fieldSchema)
    } else {
      if (_isFunction(fieldSchema)) {
        fieldSchema = [ fieldSchema ]
      }

      for (const validator of fieldSchema) {
        const fieldValidationResult = validator(value)

        if (fieldValidationResult !== true) {
          if (!result[ field ]) {
            result[ field ] = []
          }

          result[ field ].push(fieldValidationResult)
        }
      }
    }
  }

  return result
}

function _isFunction (val) {
  return typeof val === 'function'
}

function _isObject (val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false
}

module.exports = ValidationPlugin
