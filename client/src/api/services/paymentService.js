import api from '../axiosClient';

const paymentService = {
    createPaymentIntent: (amount, currency = 'usd') =>
        api.post('/payment/create-payment-intent', { amount, currency }),
};

export default paymentService;
