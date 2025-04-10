const nodemailer = require("nodemailer");

// Create a reusable transporter object using Mailtrap
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Email Notification
exports.sendNotification = async (email, { subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      text: text,
      html: html, // Optional: HTML content for the email
    };

    await transport.sendMail(mailOptions);
    console.log(`Notification sent to ${email}`);
  } catch (error) {
    console.error(`Error sending notification to ${email}:`, error);
    throw error; // Re-throw error to be handled by caller
  }
};