import { cn } from "@/lib/utils"

const Card = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

const CardHeader = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

const CardTitle = ({
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

const CardDescription = ({
  className,
  ...props
}) => {
  return (
    <p
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
}

const CardContent = ({
  // eslint-disable-next-line react/prop-types
  className,
  ...props
}) => {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  )
}

const CardFooter = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}