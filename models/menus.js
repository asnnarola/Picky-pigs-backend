// //Define name of collection
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const collectionName = "menus";
// //Define Collection schema
// const collectionSchema = {
//     name: { type: String },
//     day: { type: String, default: 0, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday", "Everyday"]},
//     time: { type: String, default: 0 },
//     available: { type: Boolean, default: false },
//     // totalItem: { type: Boolean, default: 0 },
//     isDeleted: { type: Number, default: 0 },
//     createdAt: { type: Date, default: Date.now },
//     modifiedAt: { type: Date, default: Date.now },
// };
// module.exports = require("./index")(collectionSchema, collectionName);



let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let menusSchema = new Schema({
    name: { type: String },
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Everyday"] },
    timeFrom: { type: String },
    timeTo: { type: String },
    isAvailable: { type: Boolean, default: false },
    availability: [{
        day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Everyday"] },
        isSelect: { type: Boolean, default: false }
    }],
    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admins'
    },
    styleOfmenu: { type: String },
    // totalItem: { type: Boolean, default: 0 },
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const MenusModel = mongoose.model('menus', menusSchema);

module.exports = MenusModel;
