// routers/testRouter.js

const express = require('express')

const router = express.Router()

const testController = require('../controllers/testController')

router.get('/function1', testController.functionOne)

router.get('/function2', testController.functionTwo)

/*
 * Direct REST routes
 */
router.get('/users', testController.readUsers)

router.post('/users', testController.writeUser)

/*
 * Gemini AI route
 */
router.post('/getPrompt', testController.getPrompt)

module.exports = router
