import sendGridMail from '@sendgrid/mail';

interface EmailBody {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class SendGridService {
  private sender = 'no-reply@riabkov.com';

  constructor() {
    sendGridMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  public async sendEmail(body: EmailBody): Promise<void> {
    try {
      const result = await sendGridMail.send({
        from: this.sender,
        to: body.to,
        subject: body.subject,
        text: body.text,
      });

      console.info('Email sent', result);
    } catch (error) {
      console.error('Error sending email', error);
    }
  }
}
