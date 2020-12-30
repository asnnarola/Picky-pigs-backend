
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let all_usersSchema = new Schema(
    {
        email: { type: String },
        password: { type: String },
        role: { type: String },
        emailVerified: { type: Boolean, default: false },
        accountType: { type: String, enum: ["google", "facebook", "email"], default: "email" },
        googleId: { type: String, default: null },
        facebookId: { type: String, default: null },
        forgotPasswordToken: { type: String },
        isDeleted: { type: Number, default: 0 },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

all_usersSchema.pre('save', function save(next) {
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
all_usersSchema.methods.comparePassword = function comparePassword(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        next(err, isMatch);
    });
};

const All_usersModel = mongoose.model('all_users', all_usersSchema);

module.exports = All_usersModel;

