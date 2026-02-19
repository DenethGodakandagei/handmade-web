import React, { useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
    AmericanExpressFlatRoundedIcon,
    VisaFlatRoundedIcon,
    MastercardFlatRoundedIcon
} from 'react-svg-credit-card-payment-icons';
import stripeLogo from '../../assets/stripe.png';
import { ShieldCheck, Lock } from 'lucide-react';

// Stripe CardElement styling — matches the site's minimal aesthetic
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#111111',
            fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            fontWeight: '300',
            letterSpacing: '0.02em',
            '::placeholder': {
                color: '#D1D5DB',
            },
        },
        invalid: {
            color: '#EF4444',
            iconColor: '#EF4444',
        },
    },
    hidePostalCode: true,
};

/**
 * PaymentInfo — section 03 of the checkout form.
 * Renders the real Stripe CardElement inside the Stripe provider context.
 *
 * Props:
 *   cardError  {string|null}  Any card validation message to display
 *   onCardChange {function}   Called with the CardElement onChange event
 */
export const PaymentInfo = ({ cardError, onCardChange }) => {
    const stripe = useStripe();
    const elements = useElements();

    return (
        <div className="space-y-12 mt-20">
            {/* Section header */}
            <div className="flex items-baseline gap-4 border-b border-gray-100 pb-4">
                <span className="text-xl font-light text-gray-300">03</span>
                <h2 className="text-xl font-medium tracking-tight uppercase">Transaction</h2>
            </div>

            <div className="pl-0 md:pl-8 space-y-8">
                {/* Info text */}
                <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-500 font-light max-w-md leading-relaxed">
                        All transactions are secure and encrypted. Your card details are processed directly by Stripe and never touch our servers.
                    </p>
                </div>

                {/* Stripe Card Input */}
                <div className="border border-gray-200 rounded-sm p-5 bg-white focus-within:border-black transition-colors duration-200 group">
                    <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400 mb-3 block">
                        Card Details
                    </label>
                    <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={onCardChange}
                        className="py-1"
                    />
                </div>

                {/* Card error message */}
                {cardError && (
                    <p className="text-xs text-red-500 font-medium tracking-wide -mt-4">
                        {cardError}
                    </p>
                )}

                {/* Accepted cards + Stripe badge */}
                <div className="bg-gray-50 p-5 rounded-sm border border-gray-100 flex flex-col items-center gap-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        Secured by
                    </span>
                    <div className="flex flex-wrap justify-center items-center gap-6 opacity-80 hover:opacity-100 transition-opacity duration-300">
                        <img
                            src={stripeLogo}
                            alt="Secured by Stripe"
                            className="h-10 w-auto object-contain"
                        />
                        <div className="h-5 w-px bg-gray-200 mx-1" />
                        <div className="flex gap-3 items-center">
                            <VisaFlatRoundedIcon width={36} />
                            <MastercardFlatRoundedIcon width={36} />
                            <AmericanExpressFlatRoundedIcon width={36} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                            256-bit SSL Encryption
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
