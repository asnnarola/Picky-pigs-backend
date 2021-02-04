require('dotenv').config();
// const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: '2020-08-27',
});



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
        address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
        },
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
        // trial_end: 1614686163,
        // trial_from_plan: true,
        expand: ["latest_invoice.payment_intent"],
    });

    return subscription;
}

async function getPaymentMethodToken() {
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            number: '4242424242424242',
            exp_month: 2,
            exp_year: 2022,
            cvc: '314',
        },
    });
    return paymentMethod;
}


/**Params was subscriptoinId getting from old and priceId of new paurchase plan*/
async function updateSubscription(subscriptionId, priceId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId,
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


// current_period_end
// current_period_start
// var now = moment.unix(1614686163).format("DD/MM/YYYY");
module.exports = {
    getProductsAndPlans,
    createCustomerAndSubscription,
    updateSubscription,
    getPaymentMethodToken
};
