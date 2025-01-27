import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "./lib/utils";
import { ChevronDown } from 'lucide-react';

interface SelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  className?: string;
}

export function Select<T extends string>({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select an option", 
  className 
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root 
      value={value}
      onValueChange={onValueChange}
    >
      <SelectPrimitive.Trigger 
        className={cn(
          "flex items-center justify-between w-[180px] px-3 py-2 bg-white border border-gray-300 rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {options.find(option => option.value === value)?.label || placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content 
          position="popper"
          className="z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item 
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex items-center px-3 py-2 cursor-pointer",
                  "hover:bg-gray-100 focus:bg-gray-100",
                  "data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                )}
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}