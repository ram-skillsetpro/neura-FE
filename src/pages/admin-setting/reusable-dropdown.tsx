import React, { FC } from "react";

interface Option {
  label: string;
  value: number;
}

interface DropdownProps {
  options: Option[];
  onSelect: (value: number, optionLabel: string) => void;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Dropdown: FC<DropdownProps> = ({ options, onSelect, isOpen, setOpen }) => {
  const handleOptionClick = (value: number, optionLabel: string) => {
    onSelect(value, optionLabel);
    setOpen(false);
  };

  return (
    <>
      <div className="setting-action">
        <button
          onClick={() => setOpen(!isOpen)}
          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
        >
          change
        </button>
        <div className="dropdown-container">
          {isOpen && (
            <div className="dropdown-box">
              <ul>
                {options.map((option, index) => (
                  <li
                    key={index}
                    className="border-bottom"
                    onClick={() => handleOptionClick(option.value, option.label)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
              <div className="notch"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dropdown;
