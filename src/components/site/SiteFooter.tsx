import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">Pethe's Barakshar Bio-Chemic</p>
          <p className="mt-3 max-w-md text-ink-foreground/75">
            Teaching Dr. Schuessler's twelve tissue salts to students across Maharashtra and beyond. Courses are educational and not a substitute for medical advice.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Learn</p>
          <Link to="/courses" className="text-ink-foreground/75 hover:text-ink-foreground">Courses</Link>
          <Link to="/calendar" className="text-ink-foreground/75 hover:text-ink-foreground">Calendar</Link>
          <Link to="/knowledge" className="text-ink-foreground/75 hover:text-ink-foreground">Knowledge Base</Link>
          <Link to="/blog" className="text-ink-foreground/75 hover:text-ink-foreground">Blog</Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Help</p>
          <Link to="/faq" className="text-ink-foreground/75 hover:text-ink-foreground">FAQs</Link>
          <Link to="/announcements" className="text-ink-foreground/75 hover:text-ink-foreground">Announcements</Link>
          <Link to="/contact" className="text-ink-foreground/75 hover:text-ink-foreground">Contact</Link>
          <Link to="/auth" className="text-ink-foreground/75 hover:text-ink-foreground">Student Login</Link>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15 py-5 text-center text-sm text-ink-foreground/60">
        © {new Date().getFullYear()} Pethe's Barakshar Bio-Chemic. All rights reserved.
      </div>
    </footer>
  );
}
