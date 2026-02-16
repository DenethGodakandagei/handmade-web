import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { SearchableSelect } from '../ui/SearchableSelect';
import { countries } from "@/lib/countries";
import { MapPin, Loader2, Check } from 'lucide-react';

export const Logistics = ({ register, errors, watch, setValue, shippingMethod, setShippingMethod }) => {
  const selectedCountry = watch('country');
  
  const isLogisticsComplete = 
    watch('address')?.length >= 5 && 
    watch('city')?.length >= 2 && 
    watch('postalCode')?.length >= 3 &&
    !errors.address && !errors.city && !errors.postalCode;

  return (
    <div className="space-y-12 mt-20 relative">
        <div className="flex items-baseline gap-4 border-b border-gray-100 pb-4">
            {isLogisticsComplete ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    <Check className="text-white w-3 h-3" strokeWidth={4} />
                </div>
            ) : (
                <span className="text-xl font-light text-gray-300">02</span>
            )}
            <h2 className="text-xl font-medium tracking-tight uppercase">Logistics</h2>
        </div>
        
        <div className="pl-0 md:pl-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative">
                
                {/* Address Field - Simplified */}
                <div className="col-span-full">
                    <InputField 
                        label="Street Address" 
                        register={register} 
                        name="address" 
                        error={errors.address} 
                        placeholder="Start typing your address..." 
                    />
                </div>

                <InputField label="City" register={register} name="city" error={errors.city} placeholder="City"/>
                <InputField 
                    label="Postal Code" 
                    register={register} 
                    name="postalCode" 
                    error={errors.postalCode} 
                    placeholder="Zip Code"
                    inputMode="numeric"
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                />
                
                {/* Country Selector */}
                <SearchableSelect 
                    label="Country"
                    value={selectedCountry}
                    onChange={(val) => setValue('country', val, { shouldValidate: true })}
                    options={countries.map(c => ({ value: c.name, label: c.name, name: c.name, code: c.code }))}
                    placeholder="Select Country"
                    error={errors.country}
                />
            </div>

            {/* Shipping Method */}
            <div className="pt-8 space-y-6">
                <label className="text-xs uppercase tracking-[0.15em] font-medium text-gray-400 block">Dispatch Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {['standard', 'express'].map((method) => (
                        <div 
                            key={method}
                            onClick={() => setShippingMethod(method)}
                            className={`cursor-pointer p-6 border flex justify-between items-center transition-all duration-300 group
                            ${shippingMethod === method ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div>
                                <span className="block text-sm font-bold uppercase tracking-widest group-hover:text-black transition-colors">{method}</span>
                                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider block font-medium">{method === 'standard' ? '5-7 Business Days' : '1-2 Business Days'}</span>
                            </div>
                            <span className="font-light text-lg">${method === 'standard' ? '5' : '15'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
