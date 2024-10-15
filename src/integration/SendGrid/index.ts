import sendGridMail from '@sendgrid/mail';

import { Env } from '~/core/constants';
import { logger } from '~/core/logger';

interface EmailBody {
  to: string;
  subject: string;
  html: string;
}

interface TemplateEmailBody {
  to: string;
  subject: string;
  templateId: string;
  dynamicTemplateData: Record<string, string>;
}

export class SendGridService {
  private sender = 'no-reply@riabkov.com';

  constructor() {
    sendGridMail.setApiKey(Env.SENGRID_API_KEY || '');
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

  public async sendTemplateEmail(body: TemplateEmailBody): Promise<void> {
    try {
      await sendGridMail.send({
        from: this.sender,
        to: body.to,
        subject: body.subject,
        templateId: body.templateId,
        dynamicTemplateData: {
          ...body.dynamicTemplateData,
        },
      });

      logger.info(`Email sent to ${body.to}`);
    } catch (error) {
      logger.error('Error sending email', error);
    }
  }
}
