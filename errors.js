const format = require('quick-format-unescaped')

const errors = {}

function createError (code, message) {
  errors[code] = class extends Error {
    constructor (...args) {
      super(format(message, args))

      this.name = code

      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor)
      } else {
        this.stack = (new Error(this.message)).stack
      }

      this.code = code
      this.args = args
    }
  }
}

createError('NCTX_ERR_INVALID_CONTEXT_ARGUMENT', 'Context argument must be a valid object: %s.')
createError('NCTX_ERR_DEC_ALREADY_PRESENT', 'Decorator "%s" already present.')
createError('NCTX_ERR_INVALID_SETTER', 'The prop "%s" cannot be modified by a setter operation.')

module.exports = errors
