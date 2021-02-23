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
    let freeTrail = {
        isFreeTrail: false,
        days: 90
    }

    const planList = await stripe.plans.retrieve(
        customerInfo.planId
    );

    if (planList.trial_period_days !== null) {
        freeTrail.isFreeTrail = true,
            freeTrail.days = planList.trial_period_days
    }




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

    let subscriptionObject = {
        customer: customer.id,
        items: [{
            plan: customerInfo.planId,
        }],

        expand: ["latest_invoice.payment_intent"],
    }
    if (freeTrail.isFreeTrail) {
        subscriptionObject.trial_end = moment().add(freeTrail.days, 'days').unix();
    }

    const subscription = await stripe.subscriptions.create(subscriptionObject);

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

/**Create response to set information */
function responseCreateSubscriptionFunction() {
    /**Need to information stored */
    // customerId = createCustomerAndSubscription.subscription_resp.customer
    // subscriptionId = createCustomerAndSubscription.subscription_resp.id
    // current_period_start = createCustomerAndSubscription.subscription_resp.current_period_start
    // current_period_end = createCustomerAndSubscription.subscription_resp.current_period_end
    // invoice_pdf = createCustomerAndSubscription.subscription_resp.latest_invoice.invoice_pdf

    /*validate payment confirmation*/
    //createCustomerAndSubscription.subscription_resp.latest_invoice.payment_intent.status === "succeeded"
    //createCustomerAndSubscription.subscription_resp.latest_invoice.status === "paid"
    //createCustomerAndSubscription.subscription_resp === "active"
}
module.exports = {
    getProductsAndPlans,
    createCustomerAndSubscription,
    updateSubscription,
    getPaymentMethodToken
};
