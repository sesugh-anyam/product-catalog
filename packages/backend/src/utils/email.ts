import nodemailer from 'nodemailer';

const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Product Catalog" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - Product Catalog',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 30px;
                margin: 20px 0;
              }
              .otp-box {
                background-color: #ffffff;
                border: 2px dashed #4a90e2;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #4a90e2;
                letter-spacing: 8px;
                margin: 10px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to Product Catalog!</h2>
              <p>Thank you for registering. Please use the following OTP code to verify your email address:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 14px; color: #666;">Valid for 10 minutes</p>
              </div>

              <p>If you didn't request this code, please ignore this email.</p>
              
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Welcome to Product Catalog!

Your verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Product Catalog" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password - Product Catalog',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 30px;
                margin: 20px 0;
              }
              .reset-button {
                display: inline-block;
                background-color: #4a90e2;
                color: #ffffff;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: bold;
              }
              .token-box {
                background-color: #ffffff;
                border: 2px dashed #4a90e2;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                word-break: break-all;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your Product Catalog account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">Reset Password</a>
              </div>

              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <div class="token-box">
                <p style="margin: 0; font-size: 12px;">${resetUrl}</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Reset Your Password

We received a request to reset your password for your Product Catalog account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email. Your password won't change until you create a new one.

---
This is an automated message, please do not reply to this email.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
