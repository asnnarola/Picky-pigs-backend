const bcrypt = require('bcrypt');

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurantSchema = new Schema(
    {
        isDeleted: { type: Number, default: 0 },
        name: { type: String },
        restaurantProfilePhoto: { type: String },
        restaurantCoverPhoto: { type: String },
        about: { type: String },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        info: {
            login: { type: String },
            phoneNumber: { type: String },
            mobileNumber: { type: String },
            location: { type: String },
            email: { type: String },
        },
        subscriptionLevel: { type: String },
        contactName: { type: String },
        company: { type: String },
        phoneNumber: { type: String },
        package: { type: String },
        isAgreeToTerms: { type: Boolean },
        security: {
            twoFactorAuthenticationPhoneNumber: { type: Boolean, default: false },
            twoFactorAuthenticationEmail: { type: Boolean, default: false }
        },

    },
    {
        timestamps: true
    });


restaurantSchema.pre('save', function save(next) {
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
restaurantSchema.methods.comparePassword = function comparePassword(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        next(err, isMatch);
    });
};

const RestaurantModel = mongoose.model('restaurant', restaurantSchema);

module.exports = RestaurantModel;
