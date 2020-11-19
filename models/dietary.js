//Define name of collection
const collectionName = "dietary";

//Define Collection schema
const collectionSchema = {
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
