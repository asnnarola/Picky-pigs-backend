let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let subcategorySchema = new Schema(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'category'
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        menuId: {
            type: Schema.Types.ObjectId,
            ref: 'menus'
        },
        name: { type: String, required: true },
        isDeleted: { type: Number, default: 0 },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });




const Subcategory = mongoose.model('subcategory', subcategorySchema);

module.exports = Subcategory;
