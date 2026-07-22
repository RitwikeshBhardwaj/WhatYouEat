import api from './axios.js';

export const signup = (payload) => api.post('/auth/signup', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const getMe = () => api.get('/auth/me');
export const forgotPasswordEmail = (email) => api.post('/auth/forgot-password/email', { email });
export const forgotPasswordPhone = (phone) => api.post('/auth/forgot-password/phone', { phone });
export const verifyOtp = (phone, otp) => api.post('/auth/verify-otp', { phone, otp });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });
export const resetPasswordOtp = (phone, otp, password) =>
  api.post('/auth/reset-password/otp', { phone, otp, password });
export const resetPasswordPin = (email, pin, password) =>
  api.post('/auth/reset-password/pin', { email, pin, password });
