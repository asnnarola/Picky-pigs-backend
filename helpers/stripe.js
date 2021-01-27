require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);



/**
 * @return {Array} An array of Stripe products that have 1+ plans
 * Each Stripe product contains an array of Stripe plans
 */
function getProductsAndPlans() {
    return Promise.all([
        stripe.products.list({}), // Default returns 10 products, sorted by most recent creation date
        stripe.plans.list({}), // Default returns 10 plans, sorted by most recent creation date
    ]).then(stripeData => {
        // return attachPlansToProducts(plans, products);
        return stripeData
    }).catch(err => {
        console.error('Error fetching Stripe products and plans: ', err);
        return err
    });
}


/**
 * @param {string} paymentMethodId The id of your customer's Stripe Payment Method (an 
 * abstraction of your customer's card information)
 * @param {Object} customerInfo An object containing your customer's email, name,
 * and the plan your customer wants to pay for
 * @return {Object} Your customer's newly created subscription
 */
async function createCustomerAndSubscription(paymentMethodId, customerInfo) {
    const customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: customerInfo.email,
        name: customerInfo.name,
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    });

    // const balanceTransaction = await stripe.customers.createBalanceTransaction(
    //   customer.id,
    //   {amount: -50000, currency: 'USD'}
    // );

    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
            plan: customerInfo.planId,
        }],
        // trial_from_plan: true,
        expand: ["latest_invoice.payment_intent"],
    });

    return subscription;
}

async function updateSubscription(subscriptionId, priceId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update( subscriptionId,
        {
            cancel_at_period_end: false,
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: priceId,
                },
            ],
        }
    );
    return updatedSubscription;
}


module.exports = {
    getProductsAndPlans,
    createCustomerAndSubscription,
    updateSubscription
};
