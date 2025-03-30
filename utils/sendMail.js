import nodemailer from "nodemailer";

/**
 * @desc Send an email
 * @param {string} to - The recipient's email address
 * @param {string} subject - The subject of the email
 * @param {string} text - The body of the email
 * @param {string} html - The HTML body of the email (optional)
 */
export const sendEmail = async (to, subject, text, html = "") => {
  try {
    // Configure email login credentials (e.g., using Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL, // Your Gmail username
        pass: process.env.SMTP_PASSWORD, // Your app password
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL, // Sender's email address
      to, // Recipient's email address
      subject, // Email subject
      text, // Email content in plain text
      html, // Email content in HTML (optional)
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return false;
  }
};
