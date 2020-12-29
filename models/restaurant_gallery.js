const bcrypt = require('bcrypt');

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_gallerySchema = new Schema({
    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admins'
    },
    restaurantAmbience: [{ url: { type: String } }],
    food: [{ url: { type: String } }],
    videos: [{ url: { type: String } }],
    images: [{ url: { type: String }, type: { type: String, default: "image" } }]

},
    {
        timestamps: true
    });


const Restaurant_galleryModel = mongoose.model('restaurant_gallery', restaurant_gallerySchema);

module.exports = Restaurant_galleryModel;
