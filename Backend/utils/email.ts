import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="your-logo-url.png" alt="Logo" style="max-width: 150px; margin-bottom: 20px;">
            <h1 style="color: #333333; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
              If you didn't request this password reset, please ignore this email.
            </p>
            <p style="color: #666666; font-size: 14px; line-height: 1.5;">
              This link will expire in 1 hour for security reasons.
            </p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
            <p style="color: #999999; font-size: 12px; text-align: center;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
}; 