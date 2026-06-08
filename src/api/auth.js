/**
 * src/api/auth.js — Axios instance untuk endpoint auth
 */
import client from './client'

export const authApi = {
  login    : (payload) => client.post('/auth/login', payload),
  register : (payload) => client.post('/auth/register', payload),
  logout   : ()        => client.post('/auth/logout').catch(() => {}), // silent
}

export default client