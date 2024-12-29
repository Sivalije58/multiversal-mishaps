// import * as React from "react"

// import { cn } from "~/lib/utils"

// const Card = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <div
//     ref={ref}
//     className={cn(
//       "rounded-xl border bg-card text-card-foreground shadow",
//       className
//     )}
//     {...props}
//   />
// ))
// Card.displayName = "Card"

// const CardHeader = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <div
//     ref={ref}
//     className={cn("flex flex-col space-y-1.5 p-6", className)}
//     {...props}
//   />
// ))
// CardHeader.displayName = "CardHeader"

// const CardTitle = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <div
//     ref={ref}
//     className={cn("font-semibold leading-none tracking-tight", className)}
//     {...props}
//   />
// ))
// CardTitle.displayName = "CardTitle"

// const CardDescription = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <div
//     ref={ref}
//     className={cn("text-sm text-muted-foreground", className)}
//     {...props}
//   />
// ))
// CardDescription.displayName = "CardDescription"

// const CardContent = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
// ))
// CardContent.displayName = "CardContent"

// const CardFooter = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <div
//     ref={ref}
//     className={cn("flex items-center p-6 pt-0", className)}
//     {...props}
//   />
// ))
// CardFooter.displayName = "CardFooter"

// export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
//U slucaju da se nesto zezne, ovde je gore kod. Izvini Dusane, ako nesto ne valja, prvi put mi je. 12.30.2024. 12:25 am.
import * as React from "react";
import { cn } from "~/lib/utils"; // Assuming cn is a utility function for classnames

// Utility to create common card parts
const createCardPart = <T extends React.ElementType>(
  name: string,
  defaultClassName: string
) => {
  return React.forwardRef<T, React.HTMLAttributes<T>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(defaultClassName, className)} {...props} />
  ));
};

// Create the components dynamically
const Card = createCardPart<HTMLDivElement>("Card", "rounded-xl border bg-card text-card-foreground shadow");
Card.displayName = "Card";

const CardHeader = createCardPart<HTMLDivElement>("CardHeader", "flex flex-col space-y-1.5 p-6");
CardHeader.displayName = "CardHeader";

const CardTitle = createCardPart<HTMLDivElement>("CardTitle", "font-semibold leading-none tracking-tight");
CardTitle.displayName = "CardTitle";

const CardDescription = createCardPart<HTMLDivElement>("CardDescription", "text-sm text-muted-foreground");
CardDescription.displayName = "CardDescription";

const CardContent = createCardPart<HTMLDivElement>("CardContent", "p-6 pt-0");
CardContent.displayName = "CardContent";

const CardFooter = createCardPart<HTMLDivElement>("CardFooter", "flex items-center p-6 pt-0");
CardFooter.displayName = "CardFooter";

// Export all components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
