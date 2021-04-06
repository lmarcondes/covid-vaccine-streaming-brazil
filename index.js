const axios = require('axios')
// const path = require('path');
const db = require('./db')
require('dotenv').config()
const fs = require('fs')

const apiUrl = process.env.API_URL
const apiUser = process.env.API_USER
const apiPassword = process.env.API_PASSWORD
const { tableSchema, colOrder, colNames } = JSON.parse(fs.readFileSync('./config/schema.json', 'utf8'))

const getRecords = (size, scroll, scrollId) => {
  let url
  let data
  let params
  if (scroll && scrollId) {
    url = apiUrl + '/scroll'
    data = {
      // size,
      scroll,
      scroll_id: scrollId
    }
  } else {
    url = apiUrl
    data = { size }
    params = { scroll }
  }
  // if (scroll) {
  //   data.scroll = scroll
  // }
  // if (scrollId) {
  //   data.scroll_id = scrollId
  // }
  const method = size > 10 ? 'post' : 'get'
  return new Promise((resolve, reject) => {
    axios({
      method,
      url,
      data,
      auth: {
        username: apiUser,
        password: apiPassword
      },
      params,
      responseType: 'json',
      responseEncoding: 'utf8'
    }).then((response) => {
      resolve(response)
    }).catch((error) => {
      reject(error)
    })
  })
}

const saveRecords = (records) => {
  const table = 'gov.vacinacao_covid'
  const insertQuery = `insert into ${table}(%I) values %L on conflict do nothing`
  // const selectQuery = `select document_id from ${table} where document_id in (%L)`
  return new Promise((resolve, reject) => {
    const sanitizedRecords = records.map((record) => {
      return colOrder.map((key) => {
        return db.sanitize(key, record[key], tableSchema)
      })
    })
    // INSERT filtered records in database
    db.formattedQuery(insertQuery, [colNames, sanitizedRecords])
      .then((insertResponse) => resolve(insertResponse))
      .catch((err) => reject(err))
  })
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

(async () => {
  let scrollId
  let scrollPosition = 0
  let scroll
  const size = 500
  while (true) {
    try {
      console.log('query prarms', { size, scroll, scrollId })
      const res = await getRecords(size, scroll, scrollId)
      const hits = res.data.hits.hits
      const hitsArray = hits.map((value) => {
        return value._source
      })
      if (hitsArray.length > 0) {
        const queryResponse = await saveRecords(hitsArray)
        const rowCount = queryResponse.rowCount
        if (rowCount > 0) {
          scrollPosition += 1
          scroll = `${scrollPosition}m`
        } else {
          throw new Error('no records updated')
        }
        scrollId = res.data._scroll_id
      } else {
        throw new Error('no records received')
      }
    } catch (err) {
      console.log(err)
      await sleep(1000 * 20)
      scrollPosition = 0
      scroll = `${scrollPosition}m`
      scrollId = null
    }
  }
})()
