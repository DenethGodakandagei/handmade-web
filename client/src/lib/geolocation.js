const COUNTRY_CURRENCY_MAP = {
    'AF': 'AFN', 'AL': 'ALL', 'DZ': 'DZD', 'AS': 'USD', 'AD': 'EUR', 'AO': 'AOA', 'AI': 'XCD', 'AG': 'XCD',
    'AR': 'ARS', 'AM': 'AMD', 'AW': 'AWG', 'AU': 'AUD', 'AT': 'EUR', 'AZ': 'AZN', 'BS': 'BSD', 'BH': 'BHD',
    'BD': 'BDT', 'BB': 'BBD', 'BY': 'BYN', 'BE': 'EUR', 'BZ': 'BZD', 'BJ': 'XOF', 'BM': 'BMD', 'BT': 'BTN',
    'BO': 'BOB', 'BA': 'BAM', 'BW': 'BWP', 'BV': 'NOK', 'BR': 'BRL', 'IO': 'USD', 'BN': 'BND', 'BG': 'BGN',
    'BF': 'XOF', 'BI': 'BIF', 'KH': 'KHR', 'CM': 'XAF', 'CA': 'CAD', 'CV': 'CVE', 'KY': 'KYD', 'CF': 'XAF',
    'TD': 'XAF', 'CL': 'CLP', 'CN': 'CNY', 'CX': 'AUD', 'CC': 'AUD', 'CO': 'COP', 'KM': 'KMF', 'CG': 'XAF',
    'CD': 'CDF', 'CK': 'NZD', 'CR': 'CRC', 'CI': 'XOF', 'HR': 'EUR', 'CU': 'CUP', 'CY': 'EUR', 'CZ': 'CZK',
    'DK': 'DKK', 'DJ': 'DJF', 'DM': 'XCD', 'DO': 'DOP', 'EC': 'USD', 'EG': 'EGP', 'SV': 'USD', 'GQ': 'XAF',
    'ER': 'ERN', 'EE': 'EUR', 'ET': 'ETB', 'FK': 'FKP', 'FO': 'DKK', 'FJ': 'FJD', 'FI': 'EUR', 'FR': 'EUR',
    'GF': 'EUR', 'PF': 'XPF', 'TF': 'EUR', 'GA': 'XAF', 'GM': 'GMD', 'GE': 'GEL', 'DE': 'EUR', 'GH': 'GHS',
    'GI': 'GIP', 'GR': 'EUR', 'GL': 'DKK', 'GD': 'XCD', 'GP': 'EUR', 'GU': 'USD', 'GT': 'GTQ', 'GG': 'GBP',
    'GN': 'GNF', 'GW': 'XOF', 'GY': 'GYD', 'HT': 'HTG', 'HM': 'AUD', 'VA': 'EUR', 'HN': 'HNL', 'HK': 'HKD',
    'HU': 'HUF', 'IS': 'ISK', 'IN': 'INR', 'ID': 'IDR', 'IR': 'IRR', 'iq': 'IQD', 'IE': 'EUR', 'IM': 'GBP',
    'IL': 'ILS', 'IT': 'EUR', 'JM': 'JMD', 'JP': 'JPY', 'JE': 'GBP', 'JO': 'JOD', 'KZ': 'KZT', 'KE': 'KES',
    'KI': 'AUD', 'KP': 'KPW', 'KR': 'KRW', 'KW': 'KWD', 'KG': 'KGS', 'LA': 'LAK', 'LV': 'EUR', 'LB': 'LBP',
    'LS': 'LSL', 'LR': 'LRD', 'LY': 'LYD', 'LI': 'CHF', 'LT': 'EUR', 'LU': 'EUR', 'MO': 'MOP', 'MK': 'MKD',
    'MG': 'MGA', 'MW': 'MWK', 'MY': 'MYR', 'MV': 'MVR', 'ML': 'XOF', 'MT': 'EUR', 'MH': 'USD', 'MQ': 'EUR',
    'MR': 'MRU', 'MU': 'MUR', 'YT': 'EUR', 'MX': 'MXN', 'FM': 'USD', 'MD': 'MDL', 'MC': 'EUR', 'MN': 'MNT',
    'ME': 'EUR', 'MS': 'XCD', 'MA': 'MAD', 'MZ': 'MZN', 'MM': 'MMK', 'NA': 'NAD', 'NR': 'AUD', 'NP': 'NPR',
    'NL': 'EUR', 'NC': 'XPF', 'NZ': 'NZD', 'NI': 'NIO', 'NE': 'XOF', 'NG': 'NGN', 'NU': 'NZD', 'NF': 'AUD',
    'MP': 'USD', 'NO': 'NOK', 'OM': 'OMR', 'PK': 'PKR', 'PW': 'USD', 'PS': 'ILS', 'PA': 'PAB', 'PG': 'PGK',
    'PY': 'PYG', 'PE': 'PEN', 'PH': 'PHP', 'PN': 'NZD', 'PL': 'PLN', 'PT': 'EUR', 'PR': 'USD', 'QA': 'QAR',
    'RE': 'EUR', 'RO': 'RON', 'RU': 'RUB', 'RW': 'RWF', 'BL': 'EUR', 'SH': 'SHP', 'KN': 'XCD', 'LC': 'XCD',
    'MF': 'EUR', 'PM': 'EUR', 'VC': 'XCD', 'WS': 'WST', 'SM': 'EUR', 'ST': 'STN', 'SA': 'SAR', 'SN': 'XOF',
    'RS': 'RSD', 'SC': 'SCR', 'SL': 'SLL', 'SG': 'SGD', 'SX': 'ANG', 'SK': 'EUR', 'SI': 'EUR', 'SB': 'SBD',
    'SO': 'SOS', 'ZA': 'ZAR', 'GS': 'GBP', 'SS': 'SSP', 'ES': 'EUR', 'LK': 'LKR', 'SD': 'SDG', 'SR': 'SRD',
    'SJ': 'NOK', 'SZ': 'SZL', 'SE': 'SEK', 'CH': 'CHF', 'SY': 'SYP', 'TW': 'TWD', 'TJ': 'TJS', 'TZ': 'TZS',
    'TH': 'THB', 'TL': 'USD', 'TG': 'XOF', 'TK': 'NZD', 'TO': 'TOP', 'TT': 'TTD', 'TN': 'TND', 'TR': 'TRY',
    'TM': 'TMT', 'TC': 'USD', 'TV': 'AUD', 'UG': 'UGX', 'UA': 'UAH', 'AE': 'AED', 'GB': 'GBP', 'US': 'USD',
    'UM': 'USD', 'UY': 'UYU', 'UZ': 'UZS', 'VU': 'VUV', 'VE': 'VES', 'VN': 'VND', 'VG': 'USD', 'VI': 'USD',
    'WF': 'XPF', 'EH': 'MAD', 'YE': 'YER', 'ZM': 'ZMW', 'ZW': 'ZWL'
};

/**
 * Detects the user's country based on their IP address using a free public API.
 * Returns the country name, code, dial code, and currency if successful.
 * 
 * @param {Array} countriesList - The list of supported countries to match against
 * @returns {Promise<{name: string, code: string, dial_code: string, currency: string}|null>}
 */
export const detectUserCountry = async (countriesList) => {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/country.json');
        if (!response.ok) return null;
        
        const data = await response.json();
        // GeoJS returns 'country' as the 2-letter ISO code (e.g., "LK", "US")
        const countryCode = data.country; 

        if (countryCode) {
            // Find matching country in our provided list by code
            const matched = countriesList.find(c => c.code === countryCode);
            
            if (matched) {
                return {
                    ...matched,
                    // Use our map to find currency, default to USD if not found
                    currency: COUNTRY_CURRENCY_MAP[matched.code] || 'USD'
                };
            }
        }
        return null;
    } catch (error) {
        // Silently fail to avoid console noise
        return null; 
    }
};
