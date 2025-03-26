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
        user: process.env.EMAIL_USER, // Your Gmail username
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email address
      to, // Recipient's email address
      subject, // Email subject
      text, // Email content in plain text
      html, // Email content in HTML (optional)
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
