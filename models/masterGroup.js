let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let masterGroupSchema = new Schema({
    name: { type: String, required: true },
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const MasterGroupModel = mongoose.model('masterGroup', masterGroupSchema);

module.exports = MasterGroupModel;
