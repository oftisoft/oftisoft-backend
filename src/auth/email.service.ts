import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // For development, use ethereal email (fake SMTP)
    // For production, use real SMTP (Gmail, SendGrid, etc.)
    this.createTransport();
  }

  private async createTransport() {
    // Check if we're in production
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = parseInt(this.configService.get('SMTP_PORT') || '587', 10);

    if (isProduction && smtpHost) {
      // Production: Use real SMTP (Gmail or other)
      const isGmail = smtpHost.includes('gmail') || smtpHost.includes('google');

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
        tls: isGmail
          ? {
              rejectUnauthorized: false,
              ciphers: 'SSLv3',
            }
          : undefined,
      });

      console.log('Email transport configured for production:', smtpHost);
    } else {
      // Development: Use Ethereal (fake SMTP for testing)
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Email transport configured for development (Ethereal)');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/dashboard/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Oftisoft Support" <noreply@oftisoft.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>The Oftisoft Team</p>
            </div>
            <div class="footer">
              <p>© 2026 Oftisoft. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello,
        
        We received a request to reset your password. Click the link below to reset it:
        
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
        
        Best regards,
        The Oftisoft Team
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    // In development, log the preview URL
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  async send2FASetupEmail(email: string, qrCodeUrl: string) {
    const mailOptions = {
      from: '"Oftisoft Support" <noreply@oftisoft.com>',
      to: email,
      subject: 'Two-Factor Authentication Setup',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .qr-code { text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Two-Factor Authentication</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You've enabled Two-Factor Authentication for your Oftisoft account.</p>
              <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
              <div class="qr-code">
                <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 250px;" />
              </div>
              <p><strong>Important:</strong> Save your backup codes in a safe place. You'll need them if you lose access to your authenticator app.</p>
              <p>Best regards,<br>The Oftisoft Team</p>
            </div>
            <div class="footer">
              <p>© 2026 Oftisoft. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: '"Oftisoft Support" <noreply@oftisoft.com>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: 600; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
            .button:hover { box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .link-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 14px; }
            .urgent { color: #ef4444; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Welcome to Oftisoft! Please verify your email address to complete your registration and access all features.</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-box">${verificationUrl}</div>
              <p class="urgent">⏰ This link will expire in 24 hours.</p>
              <p>If you didn't create an account with Oftisoft, please ignore this email.</p>
              <p>Best regards,<br><strong>The Oftisoft Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Oftisoft. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Verify Your Email Address

Hello,

Welcome to Oftisoft! Please verify your email address to complete your registration.

Click the link below to verify your email:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with Oftisoft, please ignore this email.

Best regards,
The Oftisoft Team
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  async sendOrderConfirmationEmail(email: string, order: any) {
    const mailOptions = {
      from: '"Oftisoft Orders" <orders@oftisoft.com>',
      to: email,
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for your order! We've received your payment and are processing your purchase.</p>
              
              <div class="order-details">
                <h3>Order #${order.orderNumber}</h3>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total:</strong> $${order.totalAmount}</p>
                <p><strong>Status:</strong> ${order.status}</p>
              </div>
              
              <p>You can view your order details and download your products from your dashboard.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard/orders" class="button">View Order</a>
              </div>
              
              <p>Best regards,<br><strong>The Oftisoft Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Oftisoft. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Order Confirmation #${order.orderNumber}

Hello,

Thank you for your order! We've received your payment and are processing your purchase.

Order Details:
- Order Number: ${order.orderNumber}
- Date: ${new Date(order.createdAt).toLocaleDateString()}
- Total: $${order.totalAmount}
- Status: ${order.status}

View your order: ${process.env.FRONTEND_URL}/dashboard/orders

Best regards,
The Oftisoft Team
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  async sendRefundEmail(email: string, order: any, refund: any) {
    const mailOptions = {
      from: '"Oftisoft Support" <support@oftisoft.com>',
      to: email,
      subject: `Refund Processed - Order #${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .refund-details { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Refund Processed</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We've processed a refund for your order.</p>
              
              <div class="refund-details">
                <h3>Refund Details</h3>
                <p><strong>Order:</strong> #${order.orderNumber}</p>
                <p><strong>Refund Amount:</strong> $${Math.abs(refund.amount)}</p>
                <p><strong>Refund Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>The refund will appear in your account within 5-10 business days depending on your payment method.</p>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br><strong>The Oftisoft Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Oftisoft. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Refund Processed - Order #${order.orderNumber}

Hello,

We've processed a refund for your order.

Refund Details:
- Order: #${order.orderNumber}
- Refund Amount: $${Math.abs(refund.amount)}
- Refund Date: ${new Date().toLocaleDateString()}

The refund will appear in your account within 5-10 business days.

Best regards,
The Oftisoft Team
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  async sendLoginOtpEmail(email: string, otp: string) {
    const mailOptions = {
      from: '"Oftisoft Security" <security@oftisoft.com>',
      to: email,
      subject: 'Your Login Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .otp-code { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px 40px; border-radius: 8px; font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 8px; display: inline-block; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Login Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to log in to your Oftisoft account using email verification. Use the code below to complete your login:</p>
              
              <div style="text-align: center;">
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This code will expire in <strong>10 minutes</strong></li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this login, please secure your account immediately</li>
                </ul>
              </div>
              
              <p>Best regards,<br><strong>The Oftisoft Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Oftisoft. All rights reserved.</p>
              <p>This is an automated security message. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Login Verification Code

Hello,

You requested to log in to your Oftisoft account using email verification.

Your verification code is: ${otp}

⚠️ Important:
- This code will expire in 10 minutes
- Do not share this code with anyone
- If you didn't request this login, please secure your account immediately

Best regards,
The Oftisoft Team
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }
}
