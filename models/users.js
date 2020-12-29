
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let usersSchema = new Schema(
    {
        fullName: { type: String },
        email: { type: String },
        phone: { type: Number },
        password: { type: String },
        profileImage: { type: String },
        dob: { type: Date },
        address: { type: String },
        gender: { type: String },
        myPreferences: {
            allergenInformation: [{
                type: Schema.Types.ObjectId,
                ref: 'allergen'
            }],
            dietaryPreferences: [{
                type: Schema.Types.ObjectId,
                ref: 'dietary'
            }],
            lifestyleChoice: [{
                type: Schema.Types.ObjectId,
                ref: 'lifestyle'
            }],
            restaurantFeatures: [{ type: String }]
        },
        isVerified: { type: Boolean, default: false },
        accountType: { type: String, enum: ["google", "facebook", "email"], default: "email" },
        googleId: { type: String, default: null },
        facebookId: { type: String, default: null },
        isDeleted: { type: Number, default: 0 },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

usersSchema.pre('save', function save(next) {
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
usersSchema.methods.comparePassword = function comparePassword(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        next(err, isMatch);
    });
};

const UsersModel = mongoose.model('users', usersSchema);

module.exports = UsersModel;

