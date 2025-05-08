import { useState, useEffect } from 'react';
import { formatPrice } from '@/utils/format';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PriceInput({ value, onChange, className = '' }: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with thousand separators but without currency
  const formatNumber = (value: string) => {
    // Remove any existing dots and replace comma with dot for parsing
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const number = parseFloat(cleanValue);
    
    if (isNaN(number)) return value;
    
    // Format with Danish locale but without currency
    const formatted = new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(number);
    
    return formatted;
  };

  // Update display value when the input value changes or focus changes
  useEffect(() => {
    if (!isFocused) {
      const numValue = value ? parseFloat(value) : undefined;
      setDisplayValue(numValue !== undefined ? formatPrice(numValue) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove everything except numbers, dots, and commas
    const rawInput = e.target.value.replace(/[^\d,]/g, '');
    
    // Don't allow multiple commas
    if ((rawInput.match(/,/g) || []).length > 1) return;

    // Format the display value with thousand separators
    const formattedInput = formatNumber(rawInput);
    setDisplayValue(formattedInput);
    
    // Convert comma to dot for the actual value and remove dots
    const valueWithDot = rawInput.replace(/\./g, '').replace(',', '.');
    onChange(valueWithDot);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format with currency when leaving the field
    const numValue = value ? parseFloat(value) : undefined;
    setDisplayValue(numValue !== undefined ? formatPrice(numValue) : '');
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      placeholder="0,00 kr."
    />
  );
} 