let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let allergenSchema = new Schema(
    {
        name: { type: String, required: true },
        superAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        description: { type: String },
        lastModifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        image: { type: String, default: null },
        status: { type: String, default: "active" }     /**active, inactive */
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const AllergenModel = mongoose.model('allergen', allergenSchema);

module.exports = AllergenModel;