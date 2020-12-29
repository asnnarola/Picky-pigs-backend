module.exports = Object.freeze({

  OBJECT_ID: require("mongoose").Schema.Types.ObjectId,
  MIME_TYPES: {
    image: ["image/png", "image/jpeg", "image/jpg"]
  },
  OK_STATUS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  MEDIA_ERROR_STATUS: 415,
  VALIDATION_FAILURE_STATUS: 417,
  DATABASE_ERROR_STATUS: 422,
  INTERNAL_SERVER_ERROR: 500,
});
