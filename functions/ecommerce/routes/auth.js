const { Router } = require('express')
const router = Router()

const { authC } = require('../controllers')

// middlewares
const authW = require('../middlewares/auth')

router.post('/sign-on', authC.signOn)
router.post('/sign-in', authC.signIn)
router.post('/sign-out', authC.signOut)
router.get('/session', authW.verifyToken, authC.session)
router.post('/register', authC.register)


module.exports = router
