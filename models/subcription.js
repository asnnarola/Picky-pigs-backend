let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let subscriptionSchema = new Schema(
    {
        status: { type: String },
        userId: { type: Schema.Types.ObjectId, ref: 'users' }, //User table id for restaurant
        customerId: { type: String },
        subscriptionId: { type: String },
        planId: { type: String },
        planName: { type: String },
        // invoiceId: { type: String },
        // invoice_pdf: { type: String },
        current_period_start: { type: Number },
        current_period_end: { type: Number },
        amount_paid: { type: Number },
        amount_currency: { type: String },
        next_payment_attempt: { type: Number },
        subscriptionStatus: { type: String },
        // paymentStatus: { type: String }
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const SubscriptionModel = mongoose.model('subscription', subscriptionSchema);

module.exports = SubscriptionModel;
