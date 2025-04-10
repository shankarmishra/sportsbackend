const nodemailer = require("nodemailer");
require("dotenv").config(); // Ensure to load environment variables from the .env file

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
    // Setting up mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM, // From email address
      to: email, // Recipient email address
      subject: subject, // Email subject
      text: text, // Plain text content of the email
      html: html, // Optional: HTML content of the email
    };

    // Send the email
    await transport.sendMail(mailOptions);
    console.log(`Notification sent to ${email}`); // Log success message
  } catch (error) {
    console.error(`Error sending notification to ${email}:`, error); // Log error message
    throw error; // Re-throw error to be handled by caller
  }
};
