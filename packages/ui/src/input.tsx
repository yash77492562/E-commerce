import  { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index?: number;  // Optional
  type: string;
  maxLength?: number;  // Optional
  name: string;
  value?: string;
  multiple?:boolean;
  id?: string;
  placeholder?: string;
  className?: string;  // Allow passing custom Tailwind styles
  parentClassName?: string;
  accept?:string;
  required?: boolean; 
  // Update these event handler types to accept the correct event parameters
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Use forwardRef to pass down the ref correctly
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  index, value, maxLength,accept, type, required,multiple, name, placeholder, className, parentClassName, id = "", onChange, onKeyDown
}, ref) => {
  return (
    <div className={`${parentClassName}`}>
      <input
        className={`bg-gray-50 font-semibold border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className}`}
        name={name}
        value={value !== undefined ? value : undefined}
        key={index !== undefined ? index : undefined}  // Only set key if index is defined
        type={type}
        id={id}
        accept={accept}
        multiple={multiple}
        maxLength={maxLength !== undefined ? maxLength : undefined}
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={ref}  // Attach the ref here using forwardRef
        placeholder={placeholder}
        required={required} // Add required attribute
      />
    </div>
  );
});

interface LabelProps {
  name: string;
  label: string;
  className?: string;  // Allow passing custom Tailwind styles
  parentClassName?: string;
  htmlFor?: string;
}

export function Label({ label, name, className, htmlFor = "", parentClassName = '' }: LabelProps) {
  return (
    <div className={`${parentClassName}`} >
      <label className={`mb-2 font-semibold ${className}`} id={name} htmlFor={htmlFor}>
        {label}
      </label>
    </div>
  );
}

export const DesignInput = forwardRef<HTMLInputElement, InputProps>(({
  index, value, maxLength, type, required, name, placeholder, className, id = "", onChange, onKeyDown
}, ref) => {
  return (
    <div>
      <input
        className={`bg-transparent focus:outline-none focus:border-b-2 focus:ring-0 border-b-2 font-normal ${className}`}
        name={name}
        value={value !== undefined ? value : undefined}
        key={index !== undefined ? index : undefined}  // Only set key if index is defined
        type={type}
        id={id}
        maxLength={maxLength !== undefined ? maxLength : undefined}
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={ref}  // Attach the ref here using forwardRef
        placeholder={placeholder}
        required={required} // Add required attribute
      />
    </div>
  );
});
