// components/AddItemField.tsx
import React, { useState } from "react";
import { Plus, XCircle } from "lucide-react";
import { FORM_STYLES } from "../constraints/ProductConstants";

interface AddItemFieldProps {
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  onAddItem: (newItem: string) => void;
  placeholder: string;
  displayMap?: (item: string) => string;
  autoCapitalize?: boolean;
}

const AddItemField: React.FC<AddItemFieldProps> = ({
  items,
  selectedValue,
  onValueChange,
  onAddItem,
  placeholder,
  displayMap,
  autoCapitalize = false
}) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");

  const handleAddNewItem = () => {
    if (!newValue.trim()) {
      setError(`${placeholder} cannot be empty`);
      return;
    }

    if (items.some(item => item.toLowerCase() === newValue.trim().toLowerCase())) {
      setError(`This ${placeholder.toLowerCase()} already exists`);
      return;
    }

    let valueToAdd = newValue.trim();
    if (autoCapitalize) {
      valueToAdd = valueToAdd.toUpperCase();
    }

    onAddItem(valueToAdd);
    setNewValue("");
    setShowAddNew(false);
    setError("");
  };

  const displayValue = (value: string): string => {
    return displayMap ? displayMap(value) : value;
  };

  return (
    <div>
      {!showAddNew ? (
        <div className="flex gap-2">
          <select
            className={`${FORM_STYLES.inputClass}`}
            value={selectedValue}
            onChange={(e) => onValueChange(e.target.value)}
          >
            {items.map((item) => (
              <option key={item} value={item}>
                {displayValue(item)}
              </option>
            ))}
          </select>
          <button 
            type="button"
            className="bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200 flex items-center justify-center"
            onClick={() => setShowAddNew(true)}
          >
            <Plus size={20} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            className={`${FORM_STYLES.inputClass} ${error ? 'border-red-500' : ''}`}
            value={newValue}
            onChange={(e) => {
              setNewValue(e.target.value);
              setError("");
            }}
          />
          <button
            type="button"
            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 flex items-center justify-center"
            onClick={handleAddNewItem}
          >
            <Plus size={20} />
          </button>
          <button
            type="button"
            className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 flex items-center justify-center"
            onClick={() => {
              setShowAddNew(false);
              setNewValue("");
              setError("");
            }}
          >
            <XCircle size={20} />
          </button>
        </div>
      )}
      {error && <p className={FORM_STYLES.errorClass}>{error}</p>}
    </div>
  );
};

export default AddItemField;