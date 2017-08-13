"use strict"

const { Database } = require('jrgql')

module.exports.MongoDbDriver = class MongoDbDriver extends Database {

  constructor() {
    super({idMember: "_id"})
  }

  async connect(url="mongodb://localhost:27017/myproject") {
    const { MongoClient } = require('mongodb')
    return MongoClient.connect(url).then(db => this.db = db)
  }

  async drop(table) {
    return this.db.collection(table).drop()
  }

  async disconnect() {
    return this.db.close()
  }

  * getValues(type) {
    if (!this.isTypeValid(type)) {
      throw(new Error("Invalid type: " + type))
    }
    const cursor = this.db.collection(type).find()
    while(!cursor.isClosed()) {
      const v = cursor.next()
      if (cursor.isClosed()) {
        return v
      } else {
        yield v
      }
    }
  }

  async create(type, value) {
    let v = JSON.parse(JSON.stringify(value))
    await this.db.collection(type).insertOne(v)
    return v
  }

  async delete(type, value) {
    return this.db.collection(type).remove(value, { justOne: true })
  }

  async update(type, value) {
    let v = JSON.parse(JSON.stringify(value))
    const filter = {}
    filter[this.idMember] = value[this.idMember]
    delete v[this.idMember]
    return this.db.collection(type).updateOne(filter, { $set: v })
  }

}
