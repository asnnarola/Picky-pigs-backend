let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_freaturesSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        averageCostOfTwoPerson: { type: Number },
        inclusiveTaxesAndCharges: { type: Boolean },
        cashAccept: { type: Boolean },
        cardAccept: { type: Boolean },
        cuisineType: [],
        restaurantFeaturesOptions: [],
        appliesOfRestaurant: { type: String }  //what was the use case?
    },
    {
        timestamps: true
    });



const Restaurant_freaturesModel = mongoose.model('restaurant_freatures', restaurant_freaturesSchema);

module.exports = Restaurant_freaturesModel;
