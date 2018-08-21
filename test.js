var hyperdb = require('hyperdb')
var hypermodel = require('./')
var ram = require('random-access-memory')
var test = require('tape')

test('basic crud', async function (t) {
  var Model = hypermodel(ram, {valueEncoding: 'json'})

  class Test extends Model {
    get value () {
      return this.node.value
    }
  }

  var test = await Test.create('entry', 'knal')
  t.ok(test instanceof Test, 'correct object class')

  test = await test.delete()
  t.ok(test.deleted, 'status set to deleted')
  t.notOk(await Test.read('entry'), 'entry removed from db')

  test = await test.update('blam')
  t.equal(test.value, 'blam', 'object value updated')

  test = await Test.read('entry')
  t.equal(test.value, 'blam', 'db value updated')

  t.end()
})

test('pass in hyperdb instance', async function (t) {
  var db = hyperdb(ram, {valueEncoding: 'json'})
  var Model = hypermodel(db)

  class Test extends Model {
    get value () {
      return this.node.value
    }
  }

  var test = await Test.create('some stuff', 'in the db')
  t.equal(test.id, 'some stuff', 'correct id')
  t.equal(test.value, 'in the db', 'correct value')
  t.end()
})
