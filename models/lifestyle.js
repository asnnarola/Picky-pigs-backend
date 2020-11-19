//Define name of collection
const collectionName = "lifestyle";

//Define Collection schema
const collectionSchema = {
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
