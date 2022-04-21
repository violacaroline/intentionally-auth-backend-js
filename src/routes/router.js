/**
 * The routes.
 */

import express from 'express'
import createError from 'http-errors'
import { router as apiRouter } from './api/v1/router.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Body & Breath ~ always present, yet often ignored' }))
router.use('/api/v1', apiRouter)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => next(createError(404)))
