import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export function AppSidebar(props: { items: MenuItem[] }) {
  const location = useLocation();

  const activeItemId = (() => {
    const exact = props.items.find((item) => item.path === location.pathname);
    if (exact) return exact.id;

    // Pick the longest matching parent path so only one menu item is active.
    const prefixMatches = props.items
      .filter((item) =>
        location.pathname.startsWith(`${item.path}/`),
      )
      .sort((a, b) => b.path.length - a.path.length);

    return prefixMatches[0]?.id;
  })();

  return (
    <aside className="fixed left-0 top-0 w-60 h-full">
      <nav className="p-2 flex flex-col h-full pt-20">
        {props?.items.map((item) => {
          return <Button key={item.id} item={item} active={item.id === activeItemId} />;
        })}

        <div className="flex-1"></div>

        <Button
          item={{
            id: "",
            label: "Return to landing page",
            icon: <ChevronLeft />,
            path: "/",
          }}
          active={false}
        />

        <div className="h-8"></div>
      </nav>
    </aside>
  );
}

function Button({ item, active }: { item: MenuItem; active?: boolean }) {
  return (
    <NavLink
      key={item.id}
      to={item.path}
      className={cn(
        "flex items-center gap-3 p-3 text-sm font-medium rounded-lg",
        active
          ? "bg-primary text-primary-foreground border-r-0"
          : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span className="*:w-5 *:h-5">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}
