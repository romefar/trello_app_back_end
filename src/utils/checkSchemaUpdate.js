/**
 * A method to set available fields to update
 * @param {Object} schema A mongoose Schema of the model
 * @param {Object} body An update object
 * @param {Array} [restrictions = []] An array of fields to exclude
 */
const checkSchemaUpdate = (schema, body, restrictions = []) => {
  const updates = Object.keys(body)
  const allowedUpdates = Object.keys(schema.obj).filter(item => !restrictions.includes(item))
  const isValidUpdate = updates.every(item => allowedUpdates.includes(item))
  return isValidUpdate
}
module.exports = checkSchemaUpdate
