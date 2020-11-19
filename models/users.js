//Define name of collection
const collectionName = "users";

//Define Collection schema
const collectionSchema = {
  fullName: { type: String },
  email: { type: String },
  phone: { type: Number },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  accountType: { type: String, enum: ["google", "facebook", "email"], default: "email"},
  googleId: { type: String, default: null},
  facebookId: { type: String, default: null},
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
