module.exports = Object.freeze({

  OBJECT_ID: require("mongoose").Schema.Types.ObjectId,
  MIME_TYPES: {
    image: ["image/png", "image/jpeg", "image/jpg"]
  },

});
