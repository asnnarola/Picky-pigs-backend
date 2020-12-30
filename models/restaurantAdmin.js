const bcrypt = require('bcrypt');

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_adminSchema = new Schema({
    isDeleted: { type: Number, default: 0 },
    name: { type: String },
    restaurantProfilePhoto: { type: String },
    restaurantCoverPhoto: { type: String },
    about: { type: String },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'all_users'
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
