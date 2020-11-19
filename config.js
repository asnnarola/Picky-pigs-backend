const log4js = require("log4js");
log4js.configure({
  appenders: {
    development: {
      type: "file",
      filename: "log_file.log"
    }
  },
  categories: {
    default: {
      appenders: ["development"],
      level: "trace"
    }
  }
});

const dotenv = require("dotenv").config();

module.exports = Object.freeze({
  // Logger configuration
  LOGGER: log4js.getLogger("development"),
  OBJECT_ID: require("mongoose").Types.ObjectId,

  //Base url
  BASE_URL: process.env.BASE_URL, // Base url of front-end(defined in .env file)

  //Database URI
  DATABASE: process.env.DATABASE,//Database URI(defined in .env file)


  CLIENT_ORIGIN: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_ORIGIN
    : 'http://localhost:3000',

  // HTTP Status Codes
  OK_STATUS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  MEDIA_ERROR_STATUS: 415,
  VALIDATION_FAILURE_STATUS: 417,
  DATABASE_ERROR_STATUS: 422,
  INTERNAL_SERVER_ERROR: 500,

  // Jwt token configuration
  SECRET_KEY: "shukrana_mushkurana", //Secret key to be encrypt data
  TOKEN_EXPIRED_TIME: "7d" // 7days of expired time

});
