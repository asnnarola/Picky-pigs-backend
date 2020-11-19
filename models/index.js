const mongoose = require("mongoose");

// Document versioning disabled by setting the versionKey to false
const versionKey = {
  versionKey: false
};

/**
 * create a new collection in mongoDb database
 * @param {Object} SchemaObject schema object of collection
 * @param {String} collectionName name of collection 
 * @return {Model} new created collection in mongoDb
 */
module.exports = function (SchemaObject, collectionName) {
  return mongoose.model(
    collectionName,
    new mongoose.Schema(SchemaObject, versionKey),
    collectionName
  );
};
