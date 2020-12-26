const bcrypt = require('bcrypt');

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_adminSchema = new Schema({
    email: { type: String },
    password: { type: String },
    isDeleted: { type: Number, default: 0 },
    forgotPasswordToken: { type: String },
    name: { type: String },
    restaurantProfilePhoto: { type: String },
    restaurantCoverPhoto: { type: String },
    about: { type: String },
    info: {
        login: { type: String },
        phoneNumber: { type: String },
        mobileNumber: { type: String },
        location: { type: String },
        email: { type: String },
    },
    security: {
        twoFactorAuthenticationPhoneNumber: { type: Boolean, default: false },
        twoFactorAuthenticationEmail: { type: Boolean, default: false }
    },
    address: {
        street: { type: String },
        locality: { type: String },
        pincode: { type: Number },
        zipcode: { type: Number },
        addLocationMap: { type: Boolean, default: false },
        shareLocationOption: { type: Boolean, default: false },
        getDirectionOption: { type: Boolean, default: false },
        map: {
            latitude: { type: String },
            longitude: { type: String },
            coordinates: [],  //first latitude, second longitude
            type: { type: String }
        }
    },
    location: {
        type: { type: String },
        coordinates: []
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
                        // startTimeUnit: { type: String },
                        endTime: { type: String },
                        // endTimeUnit: { type: String }
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
        averageCostOfTwoPerson: { type: Number },
        inclusiveTaxesAndCharges: { type: Boolean },
        cashAccept: { type: Boolean },
        cardAccept: { type: Boolean },
        cuisineType: [],
        restaurantFeaturesOptions: [],
        appliesOfRestaurant: { type: String }  //what was the use case?
    },
    galleryImages: {
        restaurantAmbience: [{ url: { type: String } }],
        food: [{ url: { type: String } }],
        videos: [{ url: { type: String } }],
        images: [{ url: { type: String }, type: { type: String, default: "image" } }]
    },
    subscriptionLevel: { type: String },

    contactName: { type: String },
    company: { type: String },
    phoneNumber: { type: String },
    package: { type: String },
    isAgreeToTerms: { type: Boolean },

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
