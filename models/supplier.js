// //Define name of collection
// const collectionName = "supplier";
// //Define Collection schema
// const collectionSchema = {
//     name: { type: String, required: true, unique: true },
//     createdAt: { type: Date, default: Date.now },
//     modifiedAt: { type: Date, default: Date.now },
// };
// module.exports = require("./index")(collectionSchema, collectionName);


let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let supplierSchema = new Schema({
    name: { type: String, required: true, unique: true },
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const SupplierModel = mongoose.model('supplier', supplierSchema);

module.exports = SupplierModel;
