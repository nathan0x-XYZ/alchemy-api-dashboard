import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-900 border-gray-800",
        stat: "bg-gray-900 border-gray-800 p-4",
        status: "bg-gray-900 border-gray-800 p-4",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  title?: string;
  value?: string | number;
  label?: string;
}

export function Card({
  className,
  variant,
  title,
  value,
  label,
  children,
  ...props
}: CardProps) {
  if (variant === 'stat') {
    return (
      <div className={cn(cardVariants({ variant }), className)} {...props}>
        {value && (
          <div className="text-2xl font-semibold text-white mb-1">{value}</div>
        )}
        {label && (
          <div className="text-sm text-gray-400">{label}</div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {title && (
        <div className="border-b border-gray-800 px-4 py-3">
          <h3 className="font-medium text-white">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
