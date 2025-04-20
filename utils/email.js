import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Email {
  constructor(user, url) {
    this.url = url;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `Ali Mahmoud <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    //send email using SendGrid service (up to 100 email per day in free trial)
    if (process.env.NODE_ENV == 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    // sending emails in development using mailTrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(templete, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${templete}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    await this.newTransport().sendMail(emailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'welcome to Natours.');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'password Reset token(only valid for 10 mintues).',
    );
  }
}
