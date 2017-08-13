"use strict"

const { jrGQL } = require('jrgql')
const { MongoDbDriver } = require('./MongoDbDriver')
const _ = require('underscore')

;(async () => {
  const exampleDbContent = require('jrgql').examples["usergroup"]
  const db = new MongoDbDriver()
  await db.connect()
  await db.init(exampleDbContent)
  const ql = new jrGQL(db)
  for (const test of exampleDbContent.tests) {
    const results = await ql.query(test.rootType, test.input)
    if (test.title == 'Action') {
      console.log(`Test "${test.title}" is skipped.`)
      continue
    }
    if (test.title == 'Mutation') {
      test.output.forEach(o => delete o[0][db.idMember])
      results.forEach(o => delete o[0][db.idMember])
    }
    if (_.isEqual(results, test.output)) {
      console.log(`Test "${test.title}" is successful.`)
    } else {
      console.log(`Test "${test.title}" failed.`)
      console.log(`Expected: ${JSON.stringify(test.output, null, "  ")}`)
      console.log(`Results: ${JSON.stringify(results, null, "  ")}`)
      console.log(`-----------------------------------`)
    }
  }
  await db.disconnect()
})()
