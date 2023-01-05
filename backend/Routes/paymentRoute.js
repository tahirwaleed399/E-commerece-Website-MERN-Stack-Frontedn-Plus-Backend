const { processPayment ,getStripeApiKeys} = require('../Controllers/paymentController');
const { isAuthenticatedUser } = require('../MiddleWares/auth');

const router = require('express').Router();



router.route('/payment/process').post(isAuthenticatedUser,processPayment);
console.log(getStripeApiKeys);

router.route('/stripeapikey').get(isAuthenticatedUser,getStripeApiKeys);
module.exports = router;


