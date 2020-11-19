//Define name of collection
const collectionName = "allergen";

//Define Collection schema
const collectionSchema = {
    name: { type: String , required:true},
    image: { type: String, default: null},
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
