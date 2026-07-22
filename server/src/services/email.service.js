import nodemailer from 'nodemailer';
import { AppError } from '../middleware/error.js';

const transporter = () =>
  nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const sendPasswordResetEmail = async (to, resetUrl) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new AppError('Email service not configured', 500, 'EMAIL_NOT_CONFIGURED');
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'WhatYouEat — Password Reset',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;line-height:1.5">
        <h2>Reset your password</h2>
        <p>You requested a password reset. Click below to set a new password. This link expires in 15 minutes.</p>
        <p><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Reset password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px">WhatYouEat</p>
      </div>`,
  };
  const info = await transporter().sendMail(mailOptions);
  return info;
};

export const sendRecoveryPinEmail = async (to, pin) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new AppError('Email service not configured', 500, 'EMAIL_NOT_CONFIGURED');
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'WhatYouEat — Your Recovery PIN',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;line-height:1.5">
        <h2>Your recovery PIN</h2>
        <p>Keep this PIN safe — you can use it to reset your password if you forget it.</p>
        <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${pin}</p>
        <p>If you didn't create an account, you can ignore this email.</p>
        <p style="color:#888;font-size:12px">WhatYouEat</p>
      </div>`,
  };
  const info = await transporter().sendMail(mailOptions);
  return info;
};
