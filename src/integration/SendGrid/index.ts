import sendGridMail from '@sendgrid/mail';

import { logger } from '../../core/logger';

interface EmailBody {
  to: string;
  subject: string;
  html: string;
}

export class SendGridService {
  private sender = 'no-reply@riabkov.com';

  constructor() {
    sendGridMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  public async sendEmail(body: EmailBody): Promise<void> {
    try {
      await sendGridMail.send({
        from: this.sender,
        to: body.to,
        subject: body.subject,
        html: body.html,
      });

      logger.info(`Email sent to ${body.to}`);
    } catch (error) {
      logger.error('Error sending email', error);
    }
  }
}
