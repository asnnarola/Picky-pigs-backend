
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
