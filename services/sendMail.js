// services/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // ضع بريد Gmail هنا أو في .env
    pass: process.env.GMAIL_APP_PASSWORD // ضع App Password هنا أو في .env
  }
});

/**
 * Send confirmation email to a user
 * @param {string} recipientEmail 
 * @param {string} message 
 */
async function sendConfirmationEmail(recipientEmail, message) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: recipientEmail,
    subject: 'PREMED - Thank you for contacting us',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f5f5f7; margin: 0; padding: 0; color: #1d1d1f; }
          .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); padding: 24px; box-sizing: border-box; }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #e3e3e3; }
          .header h1 { font-size: 28px; font-weight: 600; color: #333; margin: 0; }
          .content { padding: 24px 0; text-align: center; }
          .content p { font-size: 17px; line-height: 1.6; color: #555; margin: 0 0 16px; }
          .footer { text-align: center; padding-top: 24px; border-top: 1px solid #e3e3e3; color: #888; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Thank you for contacting us</h1></div>
          <div class="content">
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>${message}</p>
          </div>
          <div class="footer">
            <p>PREMED Solutions</p>
            <p>Riyadh, Saudi Arabia</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}

module.exports = { sendConfirmationEmail };
