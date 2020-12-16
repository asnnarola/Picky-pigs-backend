const bcrypt = require('bcrypt');

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_adminSchema = new Schema({
    email: { type: String },
    password: { type: String },
    isDeleted: { type: Number, default: 0 },
    forgotPasswordToken: { type: String },
    info: {
        login: { type: String },
        phoneNumber: { type: String },
        mobileNumber: { type: String },
        location: { type: String },
        email: { type: String },
    },
    security: {
        twoFactorAuthenticationPhoneNumber: { type: Boolean },
        twoFactorAuthenticationEmail: { type: Boolean }
    },
    address: {
        street: { type: String },
        locality: { type: String },
        pincode: { type: Number },
        zipcode: { type: Number },
        addLocationMap: { type: Boolean },
        shareLocationOption: { type: Boolean },
        getDirectionOption: { type: Boolean },
        map: {
            latitude: { type: String },
            longitude: { type: String }
        }
    },
    openingTimings: {
        isTime24Hours: { type: Boolean },
        isMultiTime: { type: Boolean },
        time: [
            {
                day: { type: String },
                timeList: [
                    {
                        startTime: { type: String },
                        endTime: { type: String }
                    }
                ]
            }
        ]
    },
    website: {
        websiteUrl: { type: String },
        isAddToProfilePage: { type: Boolean }
    },
    bookings: {
        isAvailable: { type: Boolean },
        isWebsite: { type: Boolean },
        isEmail: { type: Boolean },
        isCall: { type: Boolean },
        websiteUrl: { type: String },
        email: { type: String },
        phoneNumber: { type: String },
    },
    socialMedia: {
        isAvailable: { type: Boolean },
        isFacebook: { type: Boolean },
        isTwitter: { type: Boolean },
        isInstagram: { type: Boolean },
        facebookUrl: { type: String },
        twitterUrl: { type: String },
        instagramUrl: { type: String },
    },
    restaurantFeatures: {
        averageCostOfTwoPerson: { type: String },
        inclusiveTaxesAndCharges: { type: Boolean },
        cashAccept: { type: Boolean },
        cardAccept: { type: Boolean },
        cuisineType: [],
        restaurantFeaturesOptions: [],
        appliesOfRestaurant: { type: String }  //what was the use case?
    },

},
    {
        timestamps: true
    });


restaurant_adminSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, (errs, salt) => {
        if (errs) { return next(err); }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

// helper method to validate password
restaurant_adminSchema.methods.comparePassword = function comparePassword(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        next(err, isMatch);
    });
};

const Restaurant_adminModel = mongoose.model('restaurant_admin', restaurant_adminSchema);

module.exports = Restaurant_adminModel;
