import React from "react";
import { FORM_STYLES, } from "../constraints/ProductConstants";
import { CURRENCY_SYMBOLS } from "@/utils/currencyUtils";

interface PriceInputProps {
  price: number;
  currency: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PriceInput: React.FC<PriceInputProps> = ({ 
  price, 
  currency, 
  error, 
  onChange 
}) => {
  const getCurrencySymbol = (currencyCode: string) => {
    return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  };

  return (
    <div className="flex-1">
      <label htmlFor="price" className={FORM_STYLES.labelClass}>
        Price <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          {getCurrencySymbol(currency)}
        </span>
        <input
          type="number"
          id="price"
          name="price"
          min="0"
          step="0.01"
          className={`${FORM_STYLES.inputClass} pl-6 ${error ? 'border-red-500' : ''}`}
          value={price || ''}
          onChange={onChange}
          required
        />
      </div>
      {error && <p className={FORM_STYLES.errorClass}>{error}</p>}
    </div>
  );
};

export default PriceInput;