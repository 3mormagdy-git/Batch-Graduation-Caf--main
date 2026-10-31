// Raw calls to the /auth endpoints. They return the server's response as-is;
// authService.js decides what to store and what the pages see.
import { api } from '@/api/client.js'
import { ENDPOINTS } from '@/api/endpoints.js'

// POST /auth/login  { email, password }  ->  { accessToken, user }
export const login = ({ email, password }) =>
  api.post(ENDPOINTS.auth.login, { email, password }, { auth: false })

// POST /auth/register  { fullName, email, password, role }  ->  { message, user }
// role is 'barista' | 'cashier' | 'manager'. The new account starts inactive.
export const register = ({ fullName, email, password, role }) =>
  api.post(ENDPOINTS.auth.register, { fullName, email, password, role }, { auth: false })

// POST /auth/forgot-password  { email }  ->  { message }  (same answer for any email)
export const forgotPassword = ({ email }) =>
  api.post(ENDPOINTS.auth.forgotPassword, { email }, { auth: false })

// GET /auth/me  ->  the signed-in employee (needs the access token)
export const getMe = () => api.get(ENDPOINTS.auth.me)
