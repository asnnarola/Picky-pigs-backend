const { CLIENT_ORIGIN } = require('../config')

// This file is exporting an Object with a single key/value pair.
// However, because this is not a part of the logic of the application
// it makes sense to abstract it to another file. Plus, it is now easily
// extensible if the application needs to send different email templates
// (eg. unsubscribe) in the future.
module.exports = {
    confirm: token => ({
        subject: 'Reset password for Picky pigs',
        html: `
    <h3>Reset password of your Picky pigs account.</h3>
      <a href='${CLIENT_ORIGIN}/reset_password/${token}'>
        Click here to reset password !
      </a>
    `,
    // text: `Copy and paste this link: ${CLIENT_ORIGIN}/confirm/${token}`
    })
}
