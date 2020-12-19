const bcrypt = require('bcrypt');

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let super_adminSchema = new Schema({
    email: { type: String },
    password: { type: String },
    isDeleted: { type: Number, default: 0 },
    forgotPasswordToken: { type: String }
},
    {
        timestamps: true
    });


super_adminSchema.pre('save', function save(next) {
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
super_adminSchema.methods.comparePassword = function comparePassword(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        next(err, isMatch);
    });
};

const Super_adminModel = mongoose.model('super_admin', super_adminSchema);

module.exports = Super_adminModel;
