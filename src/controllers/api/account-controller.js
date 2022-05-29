/**
 * Module for the AccountController.
 */

import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { User } from '../../models/user.js'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Authenticates a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      const user = await User.authenticate(req.body.username, req.body.password)

      const payload = {
        sub: user.id,
        given_name: user.firstName,
        family_name: user.lastName,
        email: user.email,
        admin: user.admin
      }

      const privateKey = Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64')
      // Create the access token with the shorter lifespan.
      const accessToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: process.env.ACCESS_TOKEN_LIFE
      })

      res
        .json({
          username: user.username,
          user_id: user.id,
          access_token: accessToken,
          message: 'You are logged in'
        })
    } catch (error) {
      // Authentication failed.
      const err = createError(401)
      err.cause = error

      next(err)
    }
  }

  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        admin: req.body.admin
      })

      await user.save()

      res
        .status(201)
        .json({ id: user.id })
    } catch (error) {
      let err = error

      if (err.code === 11000) {
        // Duplicated keys.
        err = createError(409)
        err.cause = error
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.cause = error
      }

      next(err)
    }
  }

  /**
   * Deletes a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async deleteAccount (req, res, next) {
    try {
      let token = req.headers.authorization

      if (token.includes('Bearer')) {
        const authorization = token.split(' ')
        token = authorization[1]
      }
      const publicKey = Buffer.from(process.env.PUBLIC_ACCESS_TOKEN_SECRET, 'base64')

      const payload = jwt.verify(token, publicKey)

      if (!payload) {
        throw new Error('Invalid authentication token, authorization denied')
      }

      await User.findByIdAndDelete(payload.sub)

      res
        .status(204)
        .json({
          message: 'Sad to see you go, your account was deleted.'
        })
    } catch (error) {
      let err = error

      if (err.code === 500) {
        // Server error.
        err = createError(500)
        err.cause = error
      }

      next(err)
    }
  }
}
