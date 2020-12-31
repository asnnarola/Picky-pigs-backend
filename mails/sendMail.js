const nodemailer = require('nodemailer')
const ejs = require('ejs')

// The credentials for the email account you want to send mail from.
const credentials = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    // These environment variables will be pulled from the .env file
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
}
const transporter = nodemailer.createTransport(credentials)

module.exports = async (contentDetail) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(contentDetail.filePath, contentDetail, async function (err, modifiedContent) {
      if (err) {
        reject({ status: 0, error: err, "message": "Error occurred while Email template execute" });
      }
      else {
        const emailContant = {
          from: process.env.MAIL_USER,
          to: contentDetail.to,
          subject: contentDetail.subject,
          html: modifiedContent
        }
        transporter.sendMail(emailContant).
          then(emailResp => {
            resolve({ status: 1, data: emailResp });
          }).catch(error => {
            reject({ status: 0, error: error });
          })
      }
    });
  });
}
