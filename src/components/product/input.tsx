import React from 'react';

interface InputProps {
  label: string;
  value: any;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
  leftIcon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  className?: string;
}

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  leftIcon,
  rightAddon,
  className
}: InputProps) {
  return (
    <div className={className}>
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={`peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
            bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
            transition-all duration-300 placeholder-transparent
            focus:border-blue-500 focus:outline-none
            ${leftIcon ? 'pl-9' : ''} ${rightAddon ? 'pr-16' : ''}`}
        />
        <label className="absolute left-4 -top-2.5 bg-white px-1 text-gray-600 text-xs transition-all duration-300
            rounded-md
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600"
        >
          {label}
        </label>
        {rightAddon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightAddon}</span>
        )}
      </div>
    </div>
  );
}
