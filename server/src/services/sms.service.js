import twilio from 'twilio';
import { AppError } from '../middleware/error.js';

let client = null;
const getClient = () => {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !process.env.TWILIO_PHONE) {
    throw new AppError('Twilio not configured', 500, 'SMS_NOT_CONFIGURED');
  }
  client = twilio(sid, token);
  return client;
};

export const sendOtpSMS = async (to, otp) => {
  const from = process.env.TWILIO_PHONE;
  await getClient().messages.create({
    body: `Your WhatYouEat verification code is ${otp}. It expires in 5 minutes.`,
    to,
    from,
  });
};
