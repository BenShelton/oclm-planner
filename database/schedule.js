const assert = require('assert')
const setup = require('./setup')

const getCollection = new Promise(resolve => {
  setup
    .then(db => db.collection('weeks'))
    .then(resolve)
})

exports.updateAssignment = ({ weekID, name, assignment }) => {
  return getCollection
    .then(coll => {
      const query = { date: weekID }
      const update = {}
      update.$set[`${assignment}.${name}`] = assignment
      return coll.findOneAndUpdate(query, update, { returnOriginal: false })
    })
    .then(result => {
      assert.notEqual(null, result)
      return result
    })
}
