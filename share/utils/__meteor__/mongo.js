import MongoDBMemoryServer from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import faker from 'faker';

let client;
let db;
let mongoServer;

export const __setupDB = jest.fn(async () => {
  mongoServer = new MongoDBMemoryServer();
  const uri = await mongoServer.getConnectionString();
  client = await MongoClient.connect(uri);
  db = client.db('test');
});

export const __closeDB = jest.fn(async () => {
  await client.close();
  await mongoServer.stop();
});

const Collection = jest.fn(function (name) {
  if (!db) return null;

  this.collection = db.collection(name);

  return this;
});

Collection.prototype.attachSchema = jest.fn();
Collection.prototype.insert = jest.fn(async function insert(doc, ...args) {
  const writeDoc = { _id: faker.random.uuid(), ...doc };
  const { insertedId } = await this.collection.insertOne(writeDoc, ...args);
  return insertedId.toString();
});
Collection.prototype.update = jest.fn(async function update(...args) {
  const { result: { nModified } } = await this.collection.update(...args);
  return nModified;
});
Collection.prototype.remove = jest.fn(async function remove(...args) {
  const { deletedCount } = await this.collection.deleteOne(...args);
  return deletedCount;
});
Collection.prototype.findOne = jest.fn(async function findOne(...args) {
  return this.collection.findOne(...args);
});
Collection.prototype.find = jest.fn(function find(...args) {
  const cursor = this.collection.find(...args);
  return Object.assign({}, cursor, {
    fetch: jest.fn(async () => cursor.toArray()),
    count: jest.fn(async () => cursor.count()),
  });
});
Collection.prototype.helpers = jest.fn();
Collection.prototype.before = {
  insert: jest.fn(),
  update: jest.fn(),
};
Collection.prototype.after = {
  insert: jest.fn(),
  update: jest.fn(),
};
export const Mongo = { Collection };

const RemoteCollectionDriver = jest.fn();
RemoteCollectionDriver.prototype.open = jest.fn().mockReturnThis();
RemoteCollectionDriver.prototype.insert = jest.fn();
RemoteCollectionDriver.prototype.update = jest.fn();
RemoteCollectionDriver.prototype.remove = jest.fn();
RemoteCollectionDriver.prototype.findOne = jest.fn();
RemoteCollectionDriver.prototype.find = jest.fn(() => ({
  count: jest.fn(),
  fetch: jest.fn(),
}));
export const MongoInternals = { RemoteCollectionDriver };
