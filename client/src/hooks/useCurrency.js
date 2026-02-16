
import { useState, useEffect } from 'react';

/**
 * Custom hook to handle currency conversion.
 * Defaults to USD (base currency).
 * 
 * @param {string} targetCurrency - The currency code to convert to (e.g., 'LKR')
 * @returns {object} - { convertPrice, currencySymbol, loading, error, rate }
 */
export const useCurrency = (targetCurrency = 'USD') => {
    const [rate, setRate] = useState(1);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!targetCurrency || targetCurrency === 'USD') {
            setRate(1);
            setCurrencySymbol('$');
            return;
        }

        const fetchRate = async () => {
            setLoading(true);
            try {
                // Free API for exchange rates based on USD
                const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
                const data = await response.json();
                
                if (data && data.rates && data.rates[targetCurrency]) {
                    setRate(data.rates[targetCurrency]);
                    
                    // Use browser's built-in Intl to get the correct symbol
                    const formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: targetCurrency,
                    });
                    
                    // Hacky way to extract just the symbol if needed, 
                    // but better to just use the formatter for the whole price.
                    const parts = formatter.formatToParts(0);
                    const symbolPart = parts.find(part => part.type === 'currency');
                    setCurrencySymbol(symbolPart ? symbolPart.value : targetCurrency);
                    
                } else {
                    setRate(1); // Fallback to USD
                    console.warn(`Rate not found for ${targetCurrency}`);
                }
            } catch (err) {
                console.error("Currency fetch failed", err);
                setError(err);
                setRate(1); // Fallback
            } finally {
                setLoading(false);
            }
        };

        fetchRate();
    }, [targetCurrency]);

    // Format the price using Intl for perfect local display
    const formatPrice = (usdAmount) => {
        const converted = usdAmount * rate;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: targetCurrency === 'USD' ? 'USD' : targetCurrency
        }).format(converted);
    };

    // Keep raw conversion if needed
    const convertValue = (usdAmount) => {
        return (usdAmount * rate).toFixed(2);
    };

    return { formatPrice, convertValue, currencySymbol, loading, error, rate };
};
