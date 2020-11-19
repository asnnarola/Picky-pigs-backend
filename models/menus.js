//Define name of collection
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collectionName = "menus";

//Define Collection schema
const collectionSchema = {
    name: { type: String },
    day: { type: String, default: 0, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday", "Everyday"]},
    time: { type: String, default: 0 },
    available: { type: Boolean, default: false },
    // totalItem: { type: Boolean, default: 0 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
