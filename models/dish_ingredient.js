let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let dishSchema = new Schema(
    {
        item: { type: String },
        qty: { type: Number },
        // unit: { type: String },
        // allergeies: [{ type: String }],
        allergeies: [{
            type: Schema.Types.ObjectId,
            ref: 'allergen'
        }],
        // stokUnit: { type: String },
        // recipeCost: { type: Number },
        customisable: { type: Boolean },
        dishId: {
            type: Schema.Types.ObjectId,
            ref: 'dish'
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        }
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });




const DishModel = mongoose.model('dish_ingredient', dishSchema);

module.exports = DishModel;
