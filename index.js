const stripe = require('stripe')('your_stripe_secret_key');
const payoneer = require('payoneer')('your_payoneer_api_key');
// Retrieve Stripe balance
stripe.balance.retrieve(function (err, balance) {
    if (err) {
        console.error(err);
        return;
    }
    const availableBalance = balance.available[0].amount;
    // Send money to Payoneer
    payoneer.payout.send({
        recipient: 'recipient_payoneer_email@example.com',
        amount: 1000, // Amount in cents
        currency: 'USD',
        description: 'Payment from Stripe',
        // Other necessary parameters for Payoneer payout
    }, function (err, response) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(response);
    });
});