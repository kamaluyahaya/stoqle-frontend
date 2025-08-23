import React from 'react';

interface NumberInputQtyProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
}

export default function NumberInputQty({
  label,
  value,
  onChange,
  min,
  leftIcon,
  disabled = false,
}: NumberInputQtyProps) {
  const displayValue = value === undefined ? '' : value.toString();

  return (
    <div>
      <div className="relative">
        {leftIcon && (
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? 'opacity-60' : ''}`}
            aria-hidden
          >
            {leftIcon}
          </span>
        )}
        <input
          type="number"
          min={min}
          value={displayValue}
          onChange={(e) => {
            if (disabled) return;
            const val = e.target.value;
            onChange(val); // send back raw string
          }}
          disabled={disabled}
          aria-disabled={disabled}
          className={`peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
            bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
            transition-all duration-300 placeholder-transparent
            focus:border-blue-500 focus:outline-none ${leftIcon ? 'pl-9' : ''}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        <label
          className={`absolute left-4 -top-2.5 bg-white/70 px-1 text-xs transition-all duration-300
          rounded-md peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
          peer-focus:-top-2.5 peer-focus:text-xs ${disabled ? 'text-gray-400' : 'text-gray-600 peer-focus:text-black'}`}
        >
          {label}
        </label>
      </div>
    </div>
  );
}
