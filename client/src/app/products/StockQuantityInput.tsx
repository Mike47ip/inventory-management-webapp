// components/StockQuantityInput.tsx
import React from "react";
import AddItemField from "./AddItemField";
import { FORM_STYLES } from "../constraints/ProductConstants";

interface StockQuantityInputProps {
  quantity: number;
  unit: string;
  units: string[];
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUnitChange: (unit: string) => void;
  onAddUnit: (unit: string) => void;
}

const StockQuantityInput: React.FC<StockQuantityInputProps> = ({
  quantity,
  unit,
  units,
  onQuantityChange,
  onUnitChange,
  onAddUnit
}) => {
  return (
    <div>
      <label htmlFor="stockQuantity" className={FORM_STYLES.labelClass}>
        Stock Quantity <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          id="stockQuantity"
          name="stockQuantity"
          min="0"
          className={FORM_STYLES.inputClass}
          value={quantity}
          onChange={onQuantityChange}
          required
        />
        
        <div className="min-w-[150px]">
          <AddItemField
            items={units}
            selectedValue={unit}
            onValueChange={onUnitChange}
            onAddItem={onAddUnit}
            placeholder="New unit"
          />
        </div>
      </div>
      
      <p className={FORM_STYLES.helpTextClass}>0 means product is out of stock</p>
    </div>
  );
};

export default StockQuantityInput;