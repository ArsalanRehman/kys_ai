// controllers/testController.js

const { selectController } = require('../services/geminiRouter')

/*
 * Temporary in-memory database.
 *
 * Later, this can be replaced with MongoDB,
 * MSSQL, Sequelize, Prisma, or another database.
 */
const users = [
  {
    id: 1,
    username: 'Ahmet Yilmaz',
    dateOfBirth: '1992-04-18',
    department: 'Production',
  },
  {
    id: 2,
    username: 'Ayse Demir',
    dateOfBirth: '1996-09-12',
    department: 'Human Resources',
  },
  {
    id: 3,
    username: 'Mehmet Kaya',
    dateOfBirth: '1989-02-25',
    department: 'Information Technology',
  },
]

const functionOne = (req, res) => {
  return res.status(200).json({
    success: true,
    selectedAction: 'functionOne',
    message: 'You have successfully triggered Function 1',
  })
}

const functionTwo = (req, res) => {
  return res.status(200).json({
    success: true,
    selectedAction: 'functionTwo',
    message: 'You have successfully triggered Function 2',
  })
}

/**
 * Reads the current user table.
 */
const readUsers = (req, res) => {
  return res.status(200).json({
    success: true,
    selectedAction: 'readUsers',
    message: `${users.length} users were found.`,

    table: {
      columns: ['ID', 'Username', 'Date of Birth', 'Department'],

      rows: users.map((user) => ({
        id: user.id,
        username: user.username,
        dateOfBirth: user.dateOfBirth,
        department: user.department,
      })),
    },
  })
}

/**
 * Checks whether a value is a non-empty string.
 */
const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Validates a YYYY-MM-DD date.
 */
const isValidDateOfBirth = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsedDate = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(parsedDate.getTime())) {
    return false
  }

  return parsedDate.toISOString().slice(0, 10) === value
}

/**
 * Adds a user.
 *
 * It supports both:
 *
 * 1. Gemini-generated arguments:
 *    req.aiDecision.args
 *
 * 2. Normal REST body:
 *    req.body
 */
const writeUser = (req, res) => {
  const input = req.aiDecision?.args || req.body || {}

  const username =
    typeof input.username === 'string' ? input.username.trim() : ''

  const dateOfBirth =
    typeof input.dateOfBirth === 'string' ? input.dateOfBirth.trim() : ''

  const department =
    typeof input.department === 'string' ? input.department.trim() : ''

  const missingFields = []

  if (!isNonEmptyString(username)) {
    missingFields.push('username')
  }

  if (!isNonEmptyString(dateOfBirth)) {
    missingFields.push('date of birth')
  }

  if (!isNonEmptyString(department)) {
    missingFields.push('department')
  }

  /*
   * Give clear feedback when information is missing.
   */
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      selectedAction: 'writeUser',

      message: `I could not add the user. Please provide: ${missingFields.join(
        ', ',
      )}.`,

      missingFields,

      example:
        'Add a user named Ali Kaya, born on 1995-06-20, to the Production department.',
    })
  }

  if (!isValidDateOfBirth(dateOfBirth)) {
    return res.status(400).json({
      success: false,
      selectedAction: 'writeUser',

      message:
        'The date of birth is invalid. Please provide it in YYYY-MM-DD format.',

      receivedDateOfBirth: dateOfBirth,

      example: '1995-06-20',
    })
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,

    username,
    dateOfBirth,
    department,
  }

  users.push(newUser)

  return res.status(201).json({
    success: true,
    selectedAction: 'writeUser',

    message: `${newUser.username} was successfully added to the ${newUser.department} department.`,

    user: newUser,
  })
}

const getPrompt = async (req, res) => {
  try {
    const prompt =
      typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'The prompt field is required.',
      })
    }

    const aiDecision = await selectController(prompt)

    console.log('User prompt:', prompt)

    console.log('Gemini decision:', aiDecision)

    const controllerActions = {
      functionOne,
      functionTwo,
      readUsers,
      writeUser,
    }

    const selectedController = controllerActions[aiDecision.name]

    if (!selectedController) {
      return res.status(422).json({
        success: false,
        selectedAction: aiDecision.name,

        message:
          aiDecision.args?.reason ||
          'The command did not match an approved action.',
      })
    }

    /*
     * Pass extracted Gemini arguments
     * to the selected controller.
     */
    req.aiDecision = aiDecision

    return selectedController(req, res)
  } catch (error) {
    console.error('Gemini routing error:', error)

    return res.status(500).json({
      success: false,

      message: 'An error occurred while processing the AI command.',

      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  functionOne,
  functionTwo,
  readUsers,
  writeUser,
  getPrompt,
}
