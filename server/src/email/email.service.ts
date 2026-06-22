import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`SMTP Email Service initialized using host: ${host}`);
    } else {
      this.logger.warn(
        'SMTP environment variables are not fully configured. Email Service will run in Mock/Console Log mode.',
      );
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"Elivate" <no-reply@elivate.com>';
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        return true;
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        throw error;
      }
    } else {
      this.logger.log(
        `[MOCK EMAIL SENT]
To: ${to}
Subject: ${subject}
--------------------------------------------------
${html
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .substring(0, 200)}...
--------------------------------------------------`,
      );
      return true;
    }
  }

  getWelcomeTemplate(name: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Elivate</title>
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b1329;
          color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #111b36;
          border-radius: 12px;
          border: 1px solid #1e293b;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          padding: 30px 20px;
          text-align: center;
          border-bottom: 1px solid #312e81;
        }
        .logo-circle {
          display: inline-block;
          width: 50px;
          height: 50px;
          line-height: 50px;
          background: #6366f1;
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          border-radius: 12px;
          margin-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .content h2 {
          color: #ffffff;
          font-size: 20px;
          margin-top: 0;
        }
        .highlight {
          color: #818cf8;
          font-weight: 600;
        }
        .btn-wrapper {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          background: #6366f1;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 28px;
          font-weight: 600;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          transition: background 0.3s;
        }
        .btn:hover {
          background: #4f46e5;
        }
        .footer {
          background-color: #0b1120;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #1e293b;
        }
        .footer a {
          color: #818cf8;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-circle">E</div>
          <h1>ELIVATE</h1>
        </div>
        <div class="content">
          <h2>Welcome aboard, <span class="highlight">${name}</span>!</h2>
          <p>We are absolutely thrilled to welcome you to the <strong>Elivate Academic Mentorship Platform</strong>.</p>
          <p>Elivate connects ambitious students with industry-expert mentors to speed up code reviews, architecture discussions, and learning progress.</p>
          <p>Here are your next steps to get started:</p>
          <ul>
            <li>Complete your profile settings</li>
            <li>Explore available mentors matching your stack</li>
            <li>Book your first 45-minute structured evaluation session</li>
          </ul>
          <div class="btn-wrapper">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Log In to Elivate</a>
          </div>
          <p>If you have any questions or feedback along the way, feel free to reach out to our platform administrators.</p>
          <p>Happy learning,<br>The Elivate Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Elivate Platform. Secure Academic Mentorship.</p>
          <p>You received this email because you registered on our platform.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getResetPasswordTemplate(resetLink: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - Elivate</title>
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b1329;
          color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #111b36;
          border-radius: 12px;
          border: 1px solid #1e293b;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          padding: 30px 20px;
          text-align: center;
          border-bottom: 1px solid #312e81;
        }
        .logo-circle {
          display: inline-block;
          width: 50px;
          height: 50px;
          line-height: 50px;
          background: #6366f1;
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          border-radius: 12px;
          margin-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .content h2 {
          color: #ffffff;
          font-size: 20px;
          margin-top: 0;
        }
        .warning-box {
          background-color: rgba(245, 158, 11, 0.1);
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          color: #f59e0b;
          font-size: 14px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          background: #f59e0b;
          color: #0b1329 !important;
          text-decoration: none;
          padding: 12px 28px;
          font-weight: 700;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          transition: background 0.3s;
        }
        .btn:hover {
          background: #d97706;
        }
        .fallback-text {
          font-size: 12px;
          color: #64748b;
          word-break: break-all;
          margin-top: 25px;
        }
        .footer {
          background-color: #0b1120;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #1e293b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-circle">E</div>
          <h1>ELIVATE</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password for your Elivate account.</p>
          <p>Please click the button below to choose a new password. This reset link is only valid for <strong>1 hour</strong>.</p>
          
          <div class="btn-wrapper">
            <a href="${resetLink}" class="btn">Reset Password</a>
          </div>

          <div class="warning-box">
            If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.
          </div>
          
          <p class="fallback-text">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #f59e0b;">${resetLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Elivate Platform. Secure Academic Mentorship.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
