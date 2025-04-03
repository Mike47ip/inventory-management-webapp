import React from "react";
import { FORM_STYLES } from "../constraints/ProductConstants";

interface RatingInputProps {
  rating: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RatingInput: React.FC<RatingInputProps> = ({ rating, onChange }) => {
  return (
    <div>
      <label htmlFor="rating" className={FORM_STYLES.labelClass}>
        Product Rating
      </label>
      <div className="flex items-center">
        <input
          type="number"
          id="rating"
          name="rating"
          min="0"
          max="5"
          step="0.5"
          className={`${FORM_STYLES.inputClass} w-20`}
          value={rating}
          onChange={onChange}
        />
        <div className="ml-3 flex text-yellow-400 text-lg">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star}>
              {rating >= star ? "★" : "☆"}
            </span>
          ))}
        </div>
        <span className="ml-2 text-gray-500 text-sm">
          ({rating.toFixed(1)})
        </span>
      </div>
    </div>
  );
};

export default RatingInput;