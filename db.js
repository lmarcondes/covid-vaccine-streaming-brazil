const { Pool } = require('pg')
const format = require('pg-format')
require('dotenv').config()

const pool = new Pool({
  // getting env vars for db auth
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
}
)

const query = (text, params) => {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    pool.query(text, params, (err, res) => {
      const duration = Date.now() - start
      console.log('ran query', { text, duration, rowCount: res.rowCount })
      if (err) reject(err)
      resolve(res)
    })
  })
}

const formattedQuery = (text, params) => {
  return new Promise((resolve, reject) => {
    const queryText = format.withArray(text, params)
    query(queryText)
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

const sanitize = (key, value, schema) => {
  if (schema[key] === 'int') {
    return isNaN(parseInt(value)) ? 0 : parseInt(value)
  } else if (schema[key] === 'float') {
    return isNaN(parseFloat(value)) ? 0 : parseFloat(value)
  } else if (schema[key] === 'timestamp') {
    if (value == null) {
      return value
    } else if (value.length === 4) {
      return value + '01-01'
    } else {
      return value
    }
  } else {
    return value
  }
}

module.exports = {
  query,
  formattedQuery,
  sanitize
}
