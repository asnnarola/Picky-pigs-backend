let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let orderSchema = new Schema(
    {
        status: { type: String, default: "pending" },    //pending, completed, cancel
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
            ref: 'all_users'
        },
        isDeleted: { type: Number, default: 0 },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const OrderModel = mongoose.model('order', orderSchema);

module.exports = OrderModel;
