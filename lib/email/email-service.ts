/**
 * Email Notification Service
 * Sends notifications for token expiration and other events
 */

import nodemailer from 'nodemailer'
import logger from '../logging/logger'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

interface TokenExpirationData {
  platform: string
  expiresAt: Date
  daysRemaining: number
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private fromEmail: string
  private isConfigured: boolean = false

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@example.com'
    this.initializeTransporter()
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter() {
    try {
      // Check if email service is configured
      const emailService = process.env.EMAIL_SERVICE
      const emailUser = process.env.EMAIL_USER
      const emailPassword = process.env.EMAIL_PASSWORD

      if (!emailService || !emailUser || !emailPassword) {
        logger.warn('Email service not configured. Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD environment variables.')
        return
      }

      // Create transporter
      this.transporter = nodemailer.createTransport({
        service: emailService, // e.g., 'gmail', 'sendgrid'
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      })

      this.isConfigured = true
      logger.info('Email service initialized successfully')

      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email transporter verification failed', { error })
          this.isConfigured = false
        } else {
          logger.info('Email transporter is ready')
        }
      })
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error })
      this.isConfigured = false
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured. Email not sent.', {
        to: options.to,
        subject: options.subject,
      })
      return false
    }

    try {
      const mailOptions = {
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }

      const info = await this.transporter.sendMail(mailOptions)

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      })

      return true
    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error,
      })
      return false
    }
  }

  /**
   * Send token expiration warning
   */
  async sendTokenExpirationWarning(
    userEmail: string,
    data: TokenExpirationData
  ): Promise<boolean> {
    const { platform, expiresAt, daysRemaining } = data

    const platformNames: Record<string, string> = {
      google_ads: 'Google Ads',
      meta_ads: 'Meta Ads',
      linkedin_ads: 'LinkedIn Ads',
    }

    const platformName = platformNames[platform] || platform

    const subject = `${platformName} Connection Expires in ${daysRemaining} Days`

    const text = `
Hello,

Your ${platformName} connection will expire in ${daysRemaining} days (on ${expiresAt.toLocaleDateString()}).

To continue syncing your ${platformName} campaigns, please reconnect your account:

1. Log in to your dashboard
2. Go to Settings → Ad Platforms
3. Click "Connect ${platformName} (OAuth)"
4. Complete the authorization process

If you don't reconnect, we won't be able to sync your campaign data after the expiration date.

Thank you,
The Marketing Analytics Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4285F4; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .steps { background-color: white; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Action Required</h1>
    </div>
    
    <div class="content">
      <h2>${platformName} Connection Expiring Soon</h2>
      
      <div class="warning">
        <strong>Your ${platformName} connection will expire in ${daysRemaining} days</strong>
        <br>
        Expiration Date: ${expiresAt.toLocaleDateString()}
      </div>
      
      <p>To continue syncing your ${platformName} campaigns, please reconnect your account.</p>
      
      <div class="steps">
        <h3>How to Reconnect:</h3>
        <ol>
          <li>Log in to your dashboard</li>
          <li>Go to <strong>Settings → Ad Platforms</strong></li>
          <li>Click <strong>"Connect ${platformName} (OAuth)"</strong></li>
          <li>Complete the authorization process</li>
        </ol>
      </div>
      
      <p>If you don't reconnect, we won't be able to sync your campaign data after the expiration date.</p>
      
      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" class="button">
          Go to Settings
        </a>
      </center>
    </div>
    
    <div class="footer">
      <p>This is an automated message from Marketing Analytics</p>
      <p>If you have questions, please contact support</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    return await this.sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    })
  }

  /**
   * Send sync error notification
   */
  async sendSyncErrorNotification(
    userEmail: string,
    platform: string,
    errorMessage: string
  ): Promise<boolean> {
    const platformNames: Record<string, string> = {
      google_ads: 'Google Ads',
      meta_ads: 'Meta Ads',
      linkedin_ads: 'LinkedIn Ads',
    }

    const platformName = platformNames[platform] || platform

    const subject = `${platformName} Sync Failed`

    const text = `
Hello,

We encountered an error while syncing your ${platformName} data:

Error: ${errorMessage}

This might mean:
- Your account connection has expired
- Your credentials need to be updated
- There's a temporary issue with the ${platformName} API

Please check your account connection in Settings.

Thank you,
The Marketing Analytics Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .error { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Sync Error</h1>
    </div>
    
    <div class="content">
      <h2>${platformName} Sync Failed</h2>
      
      <div class="error">
        <strong>Error Message:</strong><br>
        ${errorMessage}
      </div>
      
      <h3>This might mean:</h3>
      <ul>
        <li>Your account connection has expired</li>
        <li>Your credentials need to be updated</li>
        <li>There's a temporary issue with the ${platformName} API</li>
      </ul>
      
      <p>Please check your account connection and try reconnecting if needed.</p>
      
      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" class="button">
          Check Settings
        </a>
      </center>
    </div>
    
    <div class="footer">
      <p>This is an automated message from Marketing Analytics</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    return await this.sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to Marketing Analytics!'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4285F4; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome!</h1>
    </div>
    
    <div class="content">
      <h2>Hi ${userName}!</h2>
      
      <p>Welcome to Marketing Analytics - your unified dashboard for managing campaigns across Google Ads, Meta Ads, and LinkedIn Ads.</p>
      
      <h3>Get Started:</h3>
      <ol>
        <li>Connect your advertising accounts</li>
        <li>Sync your campaign data</li>
        <li>View cross-platform analytics</li>
        <li>Get AI-powered insights</li>
      </ol>
      
      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
          Go to Dashboard
        </a>
      </center>
    </div>
    
    <div class="footer">
      <p>Need help? Contact our support team</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null

/**
 * Get email service singleton
 */
export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService()
  }
  return emailServiceInstance
}

export default getEmailService

