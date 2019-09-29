import { ObjectID, Collection, Db } from 'mongodb'
import jwt from 'jsonwebtoken'
import assert from 'assert'
import setup from './setup'
import { MongoInterface } from 'types'

interface IToken {
  _id: string
}
type CollToken = MongoInterface<IToken>

const { PASSWORD = '', JWT_SECRET = '' } = process.env

const getCollection: Promise<Collection<CollToken>> = new Promise(resolve => {
  setup
    .then((db: Db) => db.collection('auth'))
    .then(resolve)
})

export const createToken = async (password: string): Promise<{ token: string }> => {
  assert.ok(PASSWORD, 'No password set')
  assert.strictEqual(password, PASSWORD, '401')
  const _id = new ObjectID()
  const decoded: IToken = { _id: _id.toHexString() }
  const token = jwt.sign(decoded, JWT_SECRET, { expiresIn: '60d' })
  const coll = await getCollection
  await coll.insertOne({ _id })
  return { token }
}

function checkDecoded (decoded: object | string): decoded is IToken {
  return typeof decoded !== 'string'
}

export const validateToken = async (token: string): Promise<IToken> => {
  assert.ok(JWT_SECRET, 'No JWT secret set')
  const decoded = jwt.verify(token, JWT_SECRET)
  assert.ok(decoded, 'Decoded Token is empty')
  if (!checkDecoded(decoded)) return assert.fail('Decoded Token is not an object')
  const coll = await getCollection
  const query = { _id: new ObjectID(decoded._id) }
  const existingToken = await coll.findOne(query)
  assert.notStrictEqual(null, existingToken, 'Token no longer valid')
  return decoded
}

export const removeToken = async (tokenID?: string): Promise<void> => {
  assert.ok(tokenID, 'No tokenID extracted in response')
  const coll = await getCollection
  const query = { _id: new ObjectID(tokenID) }
  await coll.deleteOne(query)
}
