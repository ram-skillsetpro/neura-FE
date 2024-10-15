import React, { useState } from "react";
import { frequencyTypes } from "src/core/utils/constant";

interface FrequencyDropdownProps {
  onSelect?: (selectedOption: string) => void;
}

export const FrequencyDropdown: React.FC<FrequencyDropdownProps> = ({ onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<string>("Weekly");

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    onSelect && onSelect(option);
  };

  const handleCheckboxClick = (option: string) => {
    if (selectedOption !== option) {
      handleOptionSelect(option);
    }
  };

  return (
    <div className="obligation-menu-modal relative">
      <button className="sorting-btn down-icon cursor-pointer">{selectedOption}</button>
      <div className="obligation-menu-card rounded-6">
        <ul>
          {frequencyTypes.map((frequency, index) => (
            <li key={index}>
              <div className="truncate-line1" onClick={() => handleOptionSelect(frequency)}>
                {frequency}
              </div>
              <div className="ch-box">
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxClick(frequency)}
                  checked={selectedOption === frequency}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
