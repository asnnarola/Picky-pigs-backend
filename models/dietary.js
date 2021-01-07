
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let dietarySchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        superAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        description: { type: String },
        lastModifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        isDeleted: { type: Number, default: 0 },
        status: { type: String, default: "active" }     /**active, inactive */

    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const DietaryModel = mongoose.model('dietary', dietarySchema);

module.exports = DietaryModel;
