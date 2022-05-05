import { allowedOrigins } from './allowedOrigins.js'

export const corsOptions = {
  /**
   * CORS options.
   *
   * @param {*} origin - The origin of the request.
   * @param {*} callback - Callback.
   */
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Blocked by CORS'))
    }
  },
  optionsSuccessStatus: 200
}
