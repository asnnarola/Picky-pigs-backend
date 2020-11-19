//Define name of collection
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collectionName = "ingredient";

//Define Collection schema
const collectionSchema = {
    name: { type: String },
    size: { type: String, default: 0},
    cost: { type: Number, default: 0},
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'supplier'
    },
    locationOrigin: { type: String, default: null },
    transport: { type: String, default: null },
    masterGroup: {
        type: Schema.Types.ObjectId,
        ref: 'masterGroup'
    },
    allergenId: [{
        type: Schema.Types.ObjectId,
        ref: 'allergen'
    }],
    dietaryId: [{
        type: Schema.Types.ObjectId,
        ref: 'dietary'
    }],
    lifestyleId: [{
        type: Schema.Types.ObjectId,
        ref: 'lifestyle'
    }],
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
};

module.exports = require("./index")(collectionSchema, collectionName);
