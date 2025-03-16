import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  showBackButton?: boolean
  backUrl?: string
  backLabel?: string
  showHomeButton?: boolean
}

export function PageHeader({
  title,
  description,
  showBackButton = true,
  backUrl = "/",
  backLabel = "Indietro",
  showHomeButton = true,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)} {...props}>
      <div className="flex items-center gap-4 mb-4">
        {showBackButton && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1"
          >
            <Link href={backUrl}>
              <ChevronLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        )}
        
        {showHomeButton && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1 ml-auto"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        )}
      </div>
      
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  )
} 