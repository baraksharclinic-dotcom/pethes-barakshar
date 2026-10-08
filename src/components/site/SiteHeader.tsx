import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Leaf } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLang, type TKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const nav: { to: string; k: TKey }[] = [
  { to: "/courses", k: "courses" },
  { to: "/calendar", k: "calendar" },
  { to: "/knowledge", k: "knowledge" },
  { to: "/blog", k: "blog" },
  { to: "/faq", k: "faq" },
  { to: "/announcements", k: "announcements" },
  { to: "/contact", k: "contact" },
];

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
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold">Pethe's Barakshar</span>
            <span className="block text-xs font-semibold tracking-widest text-muted-foreground uppercase">Bio-Chemic Academy</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 xl:flex">{links}</nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "mr" : "en")} aria-label="Switch language">
            {lang === "en" ? "मराठी" : "English"}
          </Button>
          {session ? (
            <div className="hidden items-center gap-2 sm:flex">
              {isAdmin && (
                <Button asChild variant="ghost" size="sm"><Link to="/admin">{t("admin")}</Link></Button>
              )}
              <Button asChild size="sm"><Link to="/dashboard">{t("dashboard")}</Link></Button>
              <Button variant="ghost" size="sm" onClick={signOut}>{t("signOut")}</Button>
            </div>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/auth">{t("login")}</Link></Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-1 pt-12">
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
