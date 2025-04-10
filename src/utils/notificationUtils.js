const sgMail = require('@sendgrid/mail'); // Import SendGrid's mail library
require("dotenv").config(); // Ensure to load environment variables from the .env file

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send Email Notification
exports.sendNotification = async (email, { subject, text, html }) => {
  try {
    // Setting up email details for SendGrid
    const msg = {
      to: email, // Recipient's email address
      from: process.env.EMAIL_FROM, // From email address (your SendGrid verified email)
      subject: subject, // Email subject
      text: text, // Plain text content of the email
      html: html, // Optional: HTML content of the email
    };

    // Send the email using SendGrid
    await sgMail.send(msg);
    console.log(`Notification sent to ${email}`); // Log success message
  } catch (error) {
    console.error(`Error sending notification to ${email}:`, error); // Log error message
    throw error; // Re-throw error to be handled by caller
  }
};
