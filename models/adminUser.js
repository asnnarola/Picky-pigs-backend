//Define name of collection
const collectionName = "adminUser";

//Define Collection schema
const collectionSchema = {
    email: { type: String },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
