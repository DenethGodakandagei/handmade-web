
import React from 'react';
import { Gift, Package } from 'lucide-react';

export const GiftOptions = ({ register, watch, setValue }) => {
  const isGift = watch('isGift');
  const useWrapping = watch('useWrapping');

  return (
    <div className="space-y-8 border-t border-gray-100 pt-10">
      <div className="flex items-start gap-4">
        <label className="flex items-center gap-4 cursor-pointer">
          <input 
            type="checkbox" 
            {...register('isGift')} 
            className="w-5 h-5 accent-black rounded border-gray-200 cursor-pointer"
          />
          <div>
            <span className="font-medium text-lg block">Mark as Gift</span>
            <span className="text-xs text-gray-400 font-light">Includes a gift receipt without prices.</span>
          </div>
        </label>
      </div>

      {isGift && (
        <div className="pl-9 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
          
          {/* Note */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] font-medium text-gray-400">Gift Message (Optional)</label>
            <textarea
              {...register('giftNote')}
              className="w-full bg-gray-50 border border-gray-100 p-4 font-serif italic text-gray-600 focus:outline-none focus:border-black transition-colors rounded-sm min-h-[100px] resize-none"
              placeholder="Start typing your personal note..."
              maxLength={200}
            />
            <p className="text-[10px] text-right text-gray-300 font-mono tracking-wide">{watch('giftNote')?.length || 0}/200</p>
          </div>

          {/* Wrapping Option */}
          <div 
             onClick={() => setValue('useWrapping', !useWrapping)}
             className={`border p-6 cursor-pointer flex justify-between items-center transition-all duration-300 group
             ${useWrapping ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
          >
             <div className="flex items-center gap-4">
               <div className={`p-3 rounded-full transition-colors ${useWrapping ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                   <Package className="w-5 h-5" />
               </div>
               <div>
                  <span className="block font-medium">Premium Gift Wrapping</span>
                  <span className="text-xs text-gray-400 font-light">Your items wrapped in signature black paper with wax seal.</span>
               </div>
             </div>
             <span className="font-light text-lg text-gray-900">+$5.00</span>
          </div>

        </div>
      )}
    </div>
  );
};
