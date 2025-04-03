// components/CurrencyInput.tsx
import React from "react";
import AddItemField from "./AddItemField";
import { FORM_STYLES } from "../constraints/ProductConstants";
import { CURRENCY_SYMBOLS } from "@/utils/currencyUtils";


interface CurrencyInputProps {
  currency: string;
  currencies: string[];
  error?: string;
  onCurrencyChange: (currency: string) => void;
  onAddCurrency: (currency: string) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currency,
  currencies,
  error,
  onCurrencyChange,
  onAddCurrency
}) => {
  const getCurrencyDisplay = (code: string): string => {
    const symbol = CURRENCY_SYMBOLS[code] || code;
    return `${code} (${symbol})`;
  };

  return (
    <div className="flex-1">
      <label htmlFor="currency" className={FORM_STYLES.labelClass}>
        Currency <span className="text-red-500">*</span>
      </label>
      
      <AddItemField
        items={currencies}
        selectedValue={currency}
        onValueChange={onCurrencyChange}
        onAddItem={onAddCurrency}
        placeholder="New currency code"
        displayMap={getCurrencyDisplay}
        autoCapitalize={true}
      />
      
      {error && <p className={FORM_STYLES.errorClass}>{error}</p>}
    </div>
  );
};

export default CurrencyInput;