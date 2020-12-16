// //Define name of collection
// const collectionName = "dietary";
// //Define Collection schema
// const collectionSchema = {
//     name: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     modifiedAt: { type: Date, default: Date.now },
// };
// module.exports = require("./index")(collectionSchema, collectionName);


let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let dietarySchema = new Schema({
    name: { type: String, required: true, unique: true },
    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admins'
    },
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const DietaryModel = mongoose.model('dietary', dietarySchema);

module.exports = DietaryModel;
