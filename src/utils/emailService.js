const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  return await transporter.sendMail({
    from: `"Kido App" <${process.env.EMAIL}>`, 
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
