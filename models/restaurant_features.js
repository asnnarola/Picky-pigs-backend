let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_featuresSchema = new Schema(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        averageCostOfTwoPerson: { type: Number },
        inclusiveTaxesAndCharges: { type: Boolean },
        cashAccept: { type: Boolean },
        cardAccept: { type: Boolean },
        // cuisineType: [{
        //     type: Schema.Types.ObjectId,
        //     ref: 'cusine_type'
        // }],
        cuisineType: [{ type: String }],
        restaurantFeaturesOptions: [{ type: String }],
        appliesOfRestaurant: [{ type: String }],
        restaurantStyle: [{ type: String }]
    },
    {
        timestamps: true
    });



const Restaurant_featuresModel = mongoose.model('restaurant_features', restaurant_featuresSchema);

module.exports = Restaurant_featuresModel;
