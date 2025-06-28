"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/prisma/generated/prisma";
import { MoreHorizontal } from "lucide-react";

export default function ProjectCard({
  id,
  name,
  description,
  icon,
  updatedAt,
}: Project) {
  const updatedAtLocal = new Date(updatedAt).toDateString();

  return (
    <Card
      onClick={() => (window.location.href = `/project/${id}`)}
      key={id}
      className="cursor-pointer group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card/80 hover:shadow-lg w-full sm:max-w-[300px] sm:aspect-video"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Avatar>
                <AvatarFallback>
                  <Skeleton />
                </AvatarFallback>
                <AvatarImage src={icon} />
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                {name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {updatedAtLocal}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {description}
        </CardDescription>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}
