const axios = require('axios')
const catalystSDK = require('zcatalyst-sdk-node')
const catalystToken = require('../catalysToken')

const catalyst = {
  getCartas: async (req, res) => {
    const app = catalystSDK.initialize(req)
    // console.log(req)
    // res.json({req})

    let query = `SELECT Fraccionamiento, logo, img FROM fraccionamientos WHERE fraccionamientos.Active = True`
    console.log(query)
    try {
      let zcql = app.zcql()
      let zcqlPromise = zcql.executeZCQLQuery(query)
      zcqlPromise.then(async (queryResult) => {
        if (queryResult.length === 0) {
          res.send({ message: 'No hay fraccionamientos' })
        } else {
          res.send(queryResult)
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  getDetails: async (req, res) => {
    const app = catalystSDK.initialize(req)
    // console.log(req)
    // res.json({req})

    let query = `SELECT * FROM fraccionamientos WHERE fraccionamientos.Active = True`
    console.log(query)

    let zcql = app.zcql()
    let zcqlPromise = zcql.executeZCQLQuery(query)
    zcqlPromise.then(async (queryResult) => {
      if (queryResult.length === 0) {
        res.send({ message: 'No hay fraccionamientos' })
      } else {
        res.send(queryResult)
      }
    })
  },
  getTable: async (app) => {

    let query = `SELECT * FROM fraccionamientos`
    console.log(query)

    let zcql = app.zcql()
    let zcqlPromise = zcql.executeZCQLQuery(query)
    zcqlPromise.then(async (queryResult) => {
      if (queryResult.length === 0) {
        return {code: 1, message: "Error al traer tabla", data: {}}
      } else {
        return {code: 0, message: "Exitoso !!", data: queryResult}
      }
    })
  },
  getFraccionamiento: async(req, res) => {
    const app = catalystSDK.initialize(req)
    // console.log(req)
    // res.json({req})

    let query = `SELECT * FROM fraccionamientos WHERE fraccionamientos.Fraccionamiento = '${req.params.fraccionamiento}' AND fraccionamientos.Active == True`
    console.log(query)

    let zcql = app.zcql()
    let zcqlPromise = zcql.executeZCQLQuery(query)
    zcqlPromise.then(async (queryResult) => {
      if (queryResult.length === 0) {
        res.send({ message: 'No se encontro el Fraccionamiento' })
      } else {
        res.send(queryResult)
      }
    })
  }
}

module.exports = catalyst
