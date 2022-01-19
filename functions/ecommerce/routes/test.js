const express = require('express')
const router = express.Router()
const { cache } = require("../controllers/zoho")

console.log("Test router")
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// obtener Producto CRM verify?
// router.get('/getCache', cache.getCache)

module.exports = router
