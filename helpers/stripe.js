require('dotenv').config();
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
 * Pass customer info as the:
 * customerInfo = { payment_method: req.body.paymentMethodId, email: req.body.customerInfo.email, name: req.body.customerInfo.name, address: { line1: req.body.customerInfo.address.line1 || '510 Townsend St', postal_code: req.body.customerInfo.address.postal_code || '98140', city: req.body.customerInfo.address.city || 'San Francisco', state: req.body.customerInfo.address.state || 'CA', country: req.body.customerInfo.address.country || 'US', }, invoice_settings: { default_payment_method: req.body.paymentMethodId, } }
 */
async function createCustomerAndSubscription(customerInfo, planId) {
    return new Promise(async (resolve, reject) => {
        try {
            // const paymentMethod = await getPaymentMethodToken()

            // customerInfo.payment_method = paymentMethod.id
            // customerInfo.invoice_settings = {
            //     default_payment_method: paymentMethod.id,
            // }

            let freeTrail = {
                isFreeTrail: false,
                days: 90
            }

            const planList = await stripe.plans.retrieve(
                planId || 'price_1IItfiFfcmiE1IMTmuCZq1Uk'
            );
            if (planList.trial_period_days !== null) {
                freeTrail.isFreeTrail = true,
                    freeTrail.days = planList.trial_period_days
            }


            /* Create customer and set default payment method */
            await stripe.customers.create(customerInfo)
                .then(async customer => {
                    /* Create subscription and expand the latest invoice's Payment Intent 
                    * We'll check this Payment Intent's status to determine if this payment needs SCA
                    */
                    let subscriptionObject = {
                        customer: customer.id,
                        items: [{
                            plan: planId,
                        }],
                        expand: ["latest_invoice.payment_intent"],
                    }

                    if (freeTrail.isFreeTrail) {
                        subscriptionObject.trial_end = moment().add(freeTrail.days, 'days').unix();
                    }

                    const subscription = await stripe.subscriptions.create(subscriptionObject)

                    if (subscription.latest_invoice && subscription.latest_invoice.payment_intent && subscription.latest_invoice.payment_intent.status === "succeeded" && subscription.latest_invoice.status === "paid" && subscription.status === "active") {
                        const invoice_resp = await stripe.invoices.retrieveUpcoming({
                            customer: subscription.customer,
                        })
                        let subcriptionObj = {
                            customerId: subscription.customer,
                            subscriptionId: subscription.id,
                            planId: subscription.plan.id,
                            invoiceId: subscription.latest_invoice.id,
                            invoice_pdf: subscription.latest_invoice.invoice_pdf,
                            current_period_start: subscription.current_period_start,
                            current_period_end: subscription.current_period_end,
                            amount_paid: subscription.latest_invoice.amount_paid,
                            payment_intent_amount_paid: subscription.latest_invoice.payment_intent.amount,
                            amount_currency: subscription.latest_invoice.currency,
                            next_payment_attempt: invoice_resp.next_payment_attempt,
                            subscriptionStatus: subscription.status,
                            paymentStatus: subscription.latest_invoice.status
                        }

                        resolve(subcriptionObj)
                        // resolve(subscription)
                    }
                    else if (subscription.latest_invoice && subscription.latest_invoice.status === "paid" && subscription.status === "trialing") {
                        const invoice_resp = await stripe.invoices.retrieveUpcoming({
                            customer: subscription.customer,
                        })
                        let subcriptionObj = {
                            customerId: subscription.customer,
                            subscriptionId: subscription.id,
                            planId: subscription.plan.id,
                            invoiceId: subscription.latest_invoice.id,
                            invoice_pdf: subscription.latest_invoice.invoice_pdf,
                            current_period_start: subscription.current_period_start,
                            current_period_end: subscription.current_period_end,
                            amount_paid: subscription.latest_invoice.amount_paid,
                            // payment_intent_amount_paid: subscription.latest_invoice.payment_intent.amount,
                            amount_currency: subscription.latest_invoice.currency,
                            next_payment_attempt: invoice_resp.next_payment_attempt,
                            subscriptionStatus: subscription.status,
                            paymentStatus: subscription.latest_invoice.status
                        }
                        resolve(subcriptionObj)
                    }
                    else {
                        let error = {};
                        error.raw = { message: "Payment was faild", ...subscription }
                        reject(error)
                    }
                })
                .catch(error => {
                    // console.log("catch error: ", error)
                    reject(error)
                });

        } catch (error) {
            // console.log("error : ", error)
            reject(error)
        }
    })
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
    // planId = createCustomerAndSubscription.subscription_resp.plan.id
    // current_period_start = createCustomerAndSubscription.subscription_resp.current_period_start
    // current_period_end = createCustomerAndSubscription.subscription_resp.current_period_end

    // customerId = createCustomerAndSubscription.subscription_resp.customer
    // subscriptionId = createCustomerAndSubscription.subscription_resp.id
    // planId = createCustomerAndSubscription.subscription_resp.plan.id
    // invoiceId = createCustomerAndSubscription.subscription_resp.latest_invoice.id
    // invoice_pdf = createCustomerAndSubscription.subscription_resp.latest_invoice.invoice_pdf
    // current_period_start = createCustomerAndSubscription.subscription_resp.current_period_start
    // current_period_end = createCustomerAndSubscription.subscription_resp.current_period_end


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
