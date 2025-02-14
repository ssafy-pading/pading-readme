import React, { useState, useRef, useEffect } from 'react';

export interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // 토글 함수: 비활성화 상태가 아니라면 드롭다운을 열거나 닫음
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  // 옵션 클릭 시 선택된 값 업데이트 후 드롭다운 닫기
  const handleOptionClick = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  const handleClickOutside = (e: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 현재 선택된 옵션 찾기
  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={selectRef} className={`custom-select ${disabled ? 'disabled' : ''}`}>
      <div className="custom-select__selected" onClick={toggleDropdown}>
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <span className={`custom-select__arrow ${isOpen ? 'open' : ''}`}></span>
      </div>
      {isOpen && (
        <ul className="custom-select__options">
          {options.map(option => (
            <li
              key={option.value}
              className={`custom-select__option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
