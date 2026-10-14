import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Leaf } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLang, type TKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/courses", k: "courses" },
  { to: "/calendar", k: "calendar" },
  { to: "/knowledge", k: "knowledge" },
  { to: "/blog", k: "blog" },
  { to: "/faq", k: "faq" },
  { to: "/announcements", k: "announcements" },
  { to: "/contact", k: "contact" },
] as const;

export function SiteHeader() {
  const { t, lang, setLang } = useLang();
  const { session, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const toggleLang = () => setLang(lang === "en" ? "mr" : "en");
  const langLabel = lang === "en" ? "मराठी" : "English";

  const links = (
    <>
      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-[0.95rem] font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          activeProps={{ className: "text-primary bg-secondary" }}
        >
          {t(n.k)}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-[76rem] items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-5">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:size-10">
            <Leaf className="size-5" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-[0.95rem] font-semibold sm:text-lg">Pethe's Barakshar</span>
            <span className="hidden text-xs font-semibold tracking-widest text-muted-foreground uppercase sm:block">Bio-Chemic Academy</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 xl:flex">{links}</nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button variant="outline" size="sm" className="hidden h-10 sm:inline-flex" onClick={toggleLang} aria-label="Switch language">
            {langLabel}
          </Button>
          {session ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="hidden h-10 md:inline-flex">
                  <Link to="/admin">{t("admin")}</Link>
                </Button>
              )}
              <Button asChild size="sm" className="h-10">
                <Link to="/dashboard">
                  <span className="sm:hidden">{t("dashboardShort")}</span>
                  <span className="hidden sm:inline">{t("dashboard")}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="hidden h-10 md:inline-flex" onClick={signOut}>
                {t("signOut")}
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="h-10 px-3.5 sm:h-8">
              <Link to="/auth">
                <span className="sm:hidden">{t("loginShort")}</span>
                <span className="hidden sm:inline">{t("login")}</span>
              </Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 xl:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-1 pt-12">
              <Button variant="outline" className="mb-2 w-full justify-start" onClick={toggleLang} aria-label="Switch language">
                {langLabel}
              </Button>
              {links}
              <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                {session ? (
                  <>
                    {isAdmin && <Button asChild variant="outline"><Link to="/admin" onClick={() => setOpen(false)}>{t("admin")}</Link></Button>}
                    <Button asChild><Link to="/dashboard" onClick={() => setOpen(false)}>{t("dashboard")}</Link></Button>
                    <Button variant="ghost" onClick={signOut}>{t("signOut")}</Button>
                  </>
                ) : (
                  <Button asChild><Link to="/auth" onClick={() => setOpen(false)}>{t("login")}</Link></Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
