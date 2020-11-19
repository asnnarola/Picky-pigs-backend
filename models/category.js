//Define name of collection
const collectionName = "category";

//Define Collection schema
const collectionSchema = {
    name: { type: String, required: true, unique: true},
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
