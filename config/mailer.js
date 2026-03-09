require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[Email LOG] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'UNDIRA <noreply@undira.ac.id>',
      to,
      subject,
      html
    });
  } catch (err) {
    console.error('[Email Error]', err.message);
  }
}

module.exports = { sendEmail };
