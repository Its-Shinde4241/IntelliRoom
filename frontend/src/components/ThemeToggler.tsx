import { Code, Moon, Sun, Monitor, Palette } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useTheme } from "./theme-provider"
import { useSidebar } from "@/components/ui/sidebar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()
    const { open } = useSidebar()

    const getThemeLabel = (themeType: string) => {
        switch (themeType) {
            case "light": return "Light Theme"
            case "dark": return "Dark Theme"
            case "liner": return "Liner Theme"
            case "valo": return "Valo Theme"
            case "system": return "System Theme"
            default: return "Theme"
        }
    }

    // When sidebar is collapsed, show current theme icon with tooltip
    if (!open) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={`flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-accent rounded-md transition-colors ${className}`}>
                            {theme === "light" && <Sun className="h-4 w-4 text-muted-foreground" />}
                            {theme === "dark" && <Moon className="h-4 w-4 text-muted-foreground" />}
                            {theme === "liner" && <Code className="h-4 w-4 text-muted-foreground" />}
                            {theme === "valo" && <Palette className="h-4 w-4 text-muted-foreground" />}
                            {theme === "system" && <Monitor className="h-4 w-4 text-muted-foreground" />}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{getThemeLabel(theme)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // When sidebar is open, show horizontal theme toggles with tooltips
    return (
        <TooltipProvider>
            <div className={`flex items-center gap-1 p-1 bg-transparent rounded-lg ${className}`}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant={"outline"}
                            size="sm"
                            pressed={theme === "light"}
                            onPressedChange={() => setTheme("light")}
                            aria-label="Light theme"
                            className={`h-8 w-8 p-0 transition-all ${theme === "light"
                                ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                                : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                                }`}
                        >
                            <Sun className="h-4 w-4" />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Light Theme</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant={"outline"}
                            size="sm"
                            pressed={theme === "dark"}
                            onPressedChange={() => setTheme("dark")}
                            aria-label="Dark theme"
                            className={`h-8 w-8 p-0 transition-all ${theme === "dark"
                                ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                                : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                                }`}
                        >
                            <Moon className="h-4 w-4" />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Dark Theme</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant={"outline"}
                            size="sm"
                            pressed={theme === "liner"}
                            onPressedChange={() => setTheme("liner")}
                            aria-label="Mono theme"
                            className={`h-8 w-8 p-0 transition-all ${theme === "liner"
                                ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                                : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                                }`}
                        >
                            <Code className="h-4 w-4" />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Liner Theme</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant={"outline"}
                            size="sm"
                            pressed={theme === "valo"}
                            onPressedChange={() => setTheme("valo")}
                            aria-label="Valo theme"
                            className={`h-8 w-8 p-0 transition-all ${theme === "valo"
                                ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                                : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                                }`}
                        >
                            <Palette className="h-4 w-4" />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Valo Theme</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant={"outline"}
                            size="sm"
                            pressed={theme === "system"}
                            onPressedChange={() => setTheme("system")}
                            aria-label="System theme"
                            className={`h-8 w-8 p-0 transition-all ${theme === "system"
                                ? "bg-accent text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                                : "opacity-60 hover:opacity-100 hover:bg-accent/50"
                                }`}
                        >
                            <Monitor className="h-4 w-4" />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>System Theme</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}