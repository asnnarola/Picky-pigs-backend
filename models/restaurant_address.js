let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_addressSchema = new Schema(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        street: { type: String },
        locality: { type: String },
        pincode: { type: Number },
        zipcode: { type: Number },
        addLocationMap: { type: Boolean, default: false },
        shareLocationOption: { type: Boolean, default: false },
        getDirectionOption: { type: Boolean, default: false },
        map: {
            coordinates: [Number],  //first latitude, second longitude
            type: { type: String }
        }
    },
    {
        timestamps: true
    });

restaurant_addressSchema.index({ map: 1 });


const Restaurant_addressModel = mongoose.model('restaurant_address', restaurant_addressSchema);

module.exports = Restaurant_addressModel;
