import React from 'react';

interface TextareaProps {
  label: string;
  value: any;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  className?: string;
}

export default function Textarea({
  label,
  value,
  onChange,
  placeholder,
  className
}: TextareaProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <textarea
        id="floating-textarea"
        value={value}
        onChange={onChange}
        placeholder=" "
        rows={5}
        className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
          bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
          transition-all duration-300 placeholder-transparent
          focus:border-blue-500 focus:outline-none"
      />
      <label
        htmlFor="floating-textarea"
        className="absolute left-4 top-2 text-xs text-gray-600 bg-white px-1 rounded-md transition-all duration-300
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500"
      >
        {label}
      </label>
    </div>
  );
}
