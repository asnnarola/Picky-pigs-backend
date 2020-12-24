let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let orderSchema = new Schema({
    status: { type: String, default: "pending"},    //pending, completed, cancel
    orderTakenTime: { type: Date },
    orderCompletedTime: { type: Date },
    orderTaken: { type: String },
    comment: { type: String },
    fullName: { type: String },
    agreeToContent: { type: Boolean },
    itemTotalPrice: { type: Number },
    tableNo: { type: Number },

    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admin'
    },

    dishes: [
        {
            name: { type: String },
            status: { type: String, default: "pending" },   //pending, completed, delete, unavailable
            dishId: {
                type: Schema.Types.ObjectId,
                ref: 'dish'
            },
            items: [{
                name: { type: String },
                qty: { type: Number },
                unit: { type: String },
                allergeies: { type: String },
                name: { type: String },
                stokUnit: { type: String },
                recipeCost: { type: Number },
                isRemove: { type: Boolean }
            }],
            dishPrice: { type: Number },
            orderQuantity: { type: Number },
            tableNo: { type: Number },
            covers: { type: Number }
        }
    ],
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const OrderModel = mongoose.model('order', orderSchema);

module.exports = OrderModel;
