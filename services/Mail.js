import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM,
} = process.env;
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

class Mail {
  static send = (to, subject, template, params = {}) => {
    const html = fs.readFileSync(path.resolve(path.join('./view/mail', `${template}.ejs`)), 'utf-8');
    return transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html: _.template(html)(params),
    });
  };
}

export default Mail;
