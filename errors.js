const nanoerror = require('nanoerror')

const errors = {}

function createError (code, message) {
  errors[code] = nanoerror(code, message)
}

createError('NCTX_ERR_INVALID_SOURCE_ARGUMENT', 'The "source" argument must be a valid object: %s.')
createError('NCTX_ERR_DEC_ALREADY_PRESENT', 'Decorator "%s" already present.')
createError('NCTX_ERR_INVALID_SETTER', 'The prop "%s" cannot be modified by a setter operation.')
createError('NCTX_ERR_INVALID_STATE', 'The state is not valid: %s.')
createError('NCTX_ERR_INVALID_OVERWRITE_CTX_PROP', 'The prop "%s" already exists in the original context, cannot be overwrite it.')

module.exports = errors
