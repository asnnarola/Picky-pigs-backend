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

  BASE_URL: process.env.BASE_URL, // Base url of front-end(defined in .env file)
  DATABASE: process.env.DATABASE, //Database URI(defined in .env file)
  CLIENT_ORIGIN: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_ORIGIN
    : 'http://localhost:3000',
  APIURL: process.env.APIURL || 'http://localhost:3000',
  FRONT_RESTAURANT_ADMIN_URL: process.env.FRONT_RESTAURANT_ADMIN_URL || 'http://localhost:3000',
  FRONT_SUPER_ADMIN_URL: process.env.FRONT_SUPER_ADMIN_URL || 'http://localhost:3000',
  SECRET_KEY: "shukrana_mushkurana",
  TOKEN_EXPIRED_TIME: "7d"

});
