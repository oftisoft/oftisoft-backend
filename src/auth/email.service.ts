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

        if (isProduction) {
            // Production: Use real SMTP
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('SMTP_HOST'),
                port: this.configService.get('SMTP_PORT'),
                secure: true,
                auth: {
                    user: this.configService.get('SMTP_USER'),
                    pass: this.configService.get('SMTP_PASS'),
                },
            });
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
}
