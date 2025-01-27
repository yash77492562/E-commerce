import {forwardRef} from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "./lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
    </LabelPrimitive.Root>
  )
);

Label.displayName = "Label";

export { Label };
export type { LabelProps };