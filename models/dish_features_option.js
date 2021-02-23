
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let dish_features_optionSchema = new Schema(
    {
        name: { type: String, required: true },
        superAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        description: { type: String },
        image: { type: String, default: null },
        isDeleted: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }     /**active, inactive */

    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const Dish_features_optionModel = mongoose.model('dish_features_option', dish_features_optionSchema);

module.exports = Dish_features_optionModel;
