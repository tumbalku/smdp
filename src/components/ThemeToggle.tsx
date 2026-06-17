"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative w-9 h-9 rounded-xl hover:bg-muted"
            id="theme-toggle-button"
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className={theme === "light" ? "bg-muted font-semibold" : ""}
          onClick={() => setTheme("light")}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Terang (Light)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={theme === "dark" ? "bg-muted font-semibold" : ""}
          onClick={() => setTheme("dark")}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Gelap (Dark)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={theme === "system" ? "bg-muted font-semibold" : ""}
          onClick={() => setTheme("system")}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistem</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
