let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let cooking_methodSchema = new Schema(
    {
        name: { type: String, required: true },
        superAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        description: { type: String },
        image: { type: String, default: null },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true }     /**active, inactive */
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const Cooking_methodModel = mongoose.model('cooking_method', cooking_methodSchema);

module.exports = Cooking_methodModel;