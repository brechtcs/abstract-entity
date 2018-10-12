var hyperdb = require('hyperdb')

module.exports.createRepository = function (db, opts) {
  if (db.constructor.name !== 'HyperDB') {
    db = hyperdb(db, opts)
  }

  return class Entity {
    static get prefix () {
      return this.name.toLowerCase()
    }

    static identify (id) {
      return `${this.prefix}/${id}`
    }

    static create (id, val) {
      return new Promise((resolve, reject) => {
        db.put(this.identify(id), val, {
          ifNotExists: true
        }, (err, node) => {
          if (err) return reject(err)
          resolve(this.read(id))
        })
      })
    }

    static read (id) {
      return new Promise((resolve, reject) => {
        db.get(this.identify(id), (err, nodes) => {
          if (err) return reject(err)
          if (nodes.length) resolve(new this(id, nodes))
          else resolve(null)
        })
      })
    }

    constructor (id, nodes) {
      this.id = id
      this.deleted = false
      this.nodes = nodes
    }

    delete () {
      return new Promise((resolve, reject) => {
        db.del(this.node.key, (err, node) => {
          if (err) return reject(err)
          this.deleted = true
          this.nodes = [node]
          resolve(this)
        })
      })
    }

    update (val) {
      return new Promise((resolve, reject) => {
        db.put(this.node.key, val, (err, node) => {
          if (err) return reject(err)
          this.deleted = false
          this.nodes = [node]
          resolve(this)
        })
      })
    }

    set nodes (nodes) {
      this.node = nodes.pop()
      this.branches = nodes
    }
  }
}
