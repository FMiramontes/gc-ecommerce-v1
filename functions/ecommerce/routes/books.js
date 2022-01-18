const express = require('express')
const router = express.Router()

const { booksC } = require('../controllers')

const verify = require('../middlewares/auth')

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

router.post('/createLead', verify.verifyToken, booksC.createLead)

// router.post('/createFactura', verify.verifyToken, booksC.createFactura)

module.exports = router
