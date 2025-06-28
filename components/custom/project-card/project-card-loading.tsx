"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectCardLoading() {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card/80 hover:shadow-lg w-full sm:max-w-[300px] sm:aspect-video">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Skeleton className="w-[40px] h-[40px] rounded-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                <Skeleton className="w-[100px] h-[20px]" />
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Skeleton className="w-[60px] h-[10px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="flex flex-wrap gap-2">
          <Skeleton className="w-[100px] h-[15px]" />
          <Skeleton className="w-[60px] h-[15px]" />
          <Skeleton className="w-[40px] h-[15px]" />
          <Skeleton className="w-[80px] h-[15px]" />
          <Skeleton className="w-[20px] h-[15px]" />
        </CardDescription>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}
