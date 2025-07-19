import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const navItems = [
    {
      href: "/",
      title: "Home",
    },
    {
      href: "/targets",
      title: "Targets",
    },
    {
      href: "/history",
      title: "History",
      subItems: [
        {
          href: "/history/summary",
          title: "Summary",
        },
      ],
    },
  ];

  return (
    <nav
      className={cn(
        "flex space-x-2 md:flex-col md:space-x-0 md:space-y-1",
        className,
      )}
      {...props}
    >
      {navItems.map((item) => (
        <div key={item.href}>
          <NavLink
            to={item.href}
            className={({ isActive }) =>
              cn(
                "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 px-4 py-2 justify-start",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "transparent",
              )
            }
          >
            {item.title}
          </NavLink>
          {item.subItems && isActive => isActive && (
            <div className="ml-4 mt-1 space-y-1">
              {item.subItems.map((subItem) => (
                <NavLink
                  key={subItem.href}
                  to={subItem.href}
                  className={({ isActive: isSubActive }) =>
                    cn(
                      "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 px-4 py-2 justify-start",
                      isSubActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "transparent",
                    )
                  }
                >
                  {subItem.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}