const { CLIENT_ORIGIN } = require('../config/config')

// This file is exporting an Object with a single key/value pair.
// However, because this is not a part of the logic of the application
// it makes sense to abstract it to another file. Plus, it is now easily
// extensible if the application needs to send different email templates
// (eg. unsubscribe) in the future.
module.exports = {
  confirm: token => ({
    subject: 'Verification mail for Picky pigs',
    html: `
    <h3>Hi, Verification mail for Picky pigs</h3>
      <a href='${CLIENT_ORIGIN}/verify/${token}'>
        Click here to verify you email
      </a>
    `,
    text: `Copy and paste this link: ${CLIENT_ORIGIN}/confirm/${token}`
  })
}
