let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let orderDishSchema = new Schema(
    {
        name: { type: String },
        status: { type: String, default: "pending" },   //pending, completed, delete, unavailable
        dishId: {
            type: Schema.Types.ObjectId,
            ref: 'dish'
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'order'
        },
        allergenId: [{
            type: Schema.Types.ObjectId,
            ref: 'allergen'
        }],
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        orderTakenTime: { type: Date },
        orderCompletedTime: { type: Date },
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
        covers: { type: Number },
        isDeleted: { type: Number, default: 0 },
        writtenNote: { type: String },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const OrderDishModel = mongoose.model('order_dish', orderDishSchema);

module.exports = OrderDishModel;
