
import { cn } from "./lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'|'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function Button({ 
  title, 
  children,
  onClick, 
  className, 
  type = "button",
  disabled,
  loading = false,
  fullWidth = false,
  variant = 'default',
  size = 'default',
  ...props 
}: ButtonProps) {
  const variants = {
    default: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-blue-300 shadow-blue-500/50",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-200 shadow-gray-300/50",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-200",
    destructive: "text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-red-300 shadow-red-500/50",
    secondary: "text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-300 shadow-blue-200/50"
  };
  

  const sizes = {
    default: "px-5 py-2.5 text-sm",
    sm: "px-3 py-2 text-xs",
    lg: "px-6 py-3 text-base",
    icon: "p-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "relative font-medium rounded-lg",
        "focus:ring-4 focus:outline-none",
        "shadow-lg dark:shadow-lg",
        "text-center transition-all duration-200 ease-in-out",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        loading && "cursor-wait",
        fullWidth && "w-full",
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-5 w-5 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        children || title
      )}
    </button>
  );
}