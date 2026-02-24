import React from 'react';
import { 
    AmericanExpressFlatRoundedIcon,
    VisaFlatRoundedIcon,
    MastercardFlatRoundedIcon 
} from 'react-svg-credit-card-payment-icons';
import stripeLogo from '../../assets/stripe.png';

export const PaymentInfo = () => {
    return (
        <div className="space-y-12 mt-20">
            <div className="flex items-baseline gap-4 border-b border-gray-100 pb-4">
                <span className="text-xl font-light text-gray-300">03</span>
                <h2 className="text-xl font-medium tracking-tight uppercase">Transaction</h2>
            </div>
            <div className="pl-0 md:pl-8 space-y-8">
                <p className="text-sm text-gray-500 font-light max-w-md leading-relaxed">
                    All transactions are secure and encrypted. You will be redirected to Stripe to finalize your payment. No card details are ever stored on our servers.
                </p>
                
                {/* Visual Payment Methods */}
                <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 flex flex-col items-center gap-4 text-center">
                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-[0.5rem]">Secured by</span>
                     
                     <div className="flex flex-wrap justify-center items-center gap-6 opacity-80 grayscale-[20%] hover:grayscale-0 transition-all duration-300">
                        {/* Stripe - Local Asset */}
                        <img 
                            src={stripeLogo} 
                            alt="Secured by Stripe" 
                            className="h-12 w-auto mb-1 object-contain"
                        />

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        {/* Library Icons - Flat Rounded Format */}
                        <div className="flex gap-4 items-center">
                             <VisaFlatRoundedIcon width={38} />
                             <MastercardFlatRoundedIcon width={38} />
                             <AmericanExpressFlatRoundedIcon width={38} />
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};
