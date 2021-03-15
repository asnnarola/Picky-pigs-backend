
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let menusSchema = new Schema(
    {
        name: { type: String },
        timeFrom: { type: String },
        timeTo: { type: String },
        isAvailable: { type: Boolean, default: false },
        availability: [
            { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }
        ],
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        type: { type: String },
        styleOfmenu: [{ type: String }],
        isDeleted: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },     /**active, inactive */
        parentMenu: {
            type: Schema.Types.ObjectId,
            ref: 'menus'
        },
        cloneMenu: {
            type: Schema.Types.ObjectId,
            ref: 'menus'
        },
        isSeasonBase: { type: Boolean, default: false },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const MenusModel = mongoose.model('menus', menusSchema);

module.exports = MenusModel;
