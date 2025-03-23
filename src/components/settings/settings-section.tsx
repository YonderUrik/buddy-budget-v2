import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  destructive?: boolean;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  titleClassName,
  destructive = false
}: SettingsSectionProps) {
  return (
    <Card className={cn("w-full shadow-sm", destructive && "border-destructive/30", className)}>
      <CardHeader className={cn(destructive && "border-b border-destructive/20")}>
        <CardTitle className={cn("text-lg", destructive && "text-destructive", titleClassName)}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
} 