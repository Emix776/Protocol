import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Tracker", icon: LayoutDashboard },
    { href: "/stats", label: "Statistik", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-white/5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around p-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-20 h-16 gap-1 rounded-2xl transition-all duration-300 cursor-pointer",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
