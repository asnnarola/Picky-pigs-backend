
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let restaurant_features_optionSchema = new Schema(
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

const Restaurant_features_optionModel = mongoose.model('restaurant_features_option', restaurant_features_optionSchema);

module.exports = Restaurant_features_optionModel;
