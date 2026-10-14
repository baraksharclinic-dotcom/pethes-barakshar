import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PlayCircle, FileText, BookOpen, Link2, HelpCircle, Search, ArrowRight, CalendarDays, Youtube, Play, Sprout } from 'lucide-react';
import { catalogOptions, pageHead } from '@/lib/academy';
import { RouteError, RouteMissing } from '@/components/academy/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import hero from '@/assets/resources-hero.jpg';
import videoThumb from '@/assets/resources-video.jpg';
import blogFallback from '@/assets/blog-notes.jpg';

export const Route = createFileRoute('/resources')({
  head: () => pageHead('Resources', 'Videos, blog articles, study notes, and learning resources from Pethe\'s Barakshar Bio-Chemic Academy.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogOptions),
  component: Resources,
  errorComponent: RouteError,
  notFoundComponent: RouteMissing,
});

const youtubeId = (url: string) => {
  try { const u = new URL(url); if (u.hostname.includes('youtu.be')) return u.pathname.slice(1); return u.searchParams.get('v') ?? u.pathname.split('/').pop() ?? null; } catch { return null; }
};
const linkIcons = { youtube: Youtube, file: FileText, book: BookOpen, link: Link2 } as const;
const fmt = (s: string) => new Date(s).toLocaleDateString('en-IN', { dateStyle: 'medium' });

function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return href.startsWith('/') ? <a href={href} className={className}>{children}</a> : <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}

function Resources() {
  const { data } = useSuspenseQuery(catalogOptions);
  const [q, setQ] = useState('');
  const [playing, setPlaying] = useState(false);
  const term = q.trim().toLowerCase();
  const posts = useMemo(() => data.posts.filter(p => !term || `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(term)), [data.posts, term]);
  const notes = useMemo(() => term ? data.articles.filter(a => `${a.title} ${a.summary} ${a.category}`.toLowerCase().includes(term)) : [], [data.articles, term]);
  const v = data.featured;
  const vid = v ? youtubeId(v.video_url) : null;

  const cards = [
    { icon: PlayCircle, title: 'Video Library', text: 'Watch lectures, tutorials and expert sessions', href: '#featured-video' },
    { icon: FileText, title: 'Blog Articles', text: 'Read practical tips, insights and updates', href: '/blog' },
    { icon: BookOpen, title: 'Study Notes', text: 'Notes, guides and reference material', href: '/knowledge' },
    { icon: Link2, title: 'External Links', text: 'Useful websites and learning resources', href: '#quick-links' },
    { icon: HelpCircle, title: 'FAQs', text: 'Quick answers to common questions', href: '/faq' },
  ];

  return <>
    <section className="relative overflow-hidden bg-ink text-ink-foreground">
      <img src={hero} alt="Tissue salt bottle with chamomile flowers and an old herbal book" width={1600} height={640} className="absolute inset-0 h-full w-full object-cover object-right" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
      <div className="container-page relative py-16 sm:py-24">
        <p className="text-sm font-bold tracking-[0.2em] text-accent">LEARN · EXPLORE · GROW</p>
        <h1 className="mt-3 font-display text-5xl font-semibold sm:text-7xl">Resources</h1>
        <p className="mt-5 max-w-xl text-lg text-ink-foreground/85">Access helpful videos, blog articles, study notes, and more — all in one place to support your learning journey.</p>
        <div className="relative mt-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} aria-label="Search resources" placeholder="Search articles, notes and topics…" className="h-13 rounded-full border-0 bg-background pl-12 text-base text-foreground shadow-lg" />
        </div>
      </div>
    </section>

    <section className="container-page -mt-0 py-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map(c => <SmartLink key={c.title} href={c.href} className="group rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><c.icon className="size-5" /></span>
          <h2 className="mt-4 font-display text-xl font-semibold">{c.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
        </SmartLink>)}
      </div>
    </section>

    {term && <section className="container-page pb-4">
      <p className="text-muted-foreground">{posts.length + notes.length} result(s) for “{q}”</p>
      {notes.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-2">{notes.map(n => <Link key={n.id} to="/knowledge/$slug" params={{ slug: n.slug }} className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:bg-muted"><BookOpen className="size-5 text-primary" /><span className="flex-1"><span className="block font-semibold">{n.title}</span><span className="text-sm text-muted-foreground">Study note · {n.category}</span></span><ArrowRight className="size-4" /></Link>)}</div>}
    </section>}

    <section className="bg-secondary/60 py-14">
      <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.3fr_0.9fr] lg:items-center">
        {v ? <>
          <div id="featured-video" className="scroll-mt-24">
            <p className="text-sm font-bold tracking-[0.15em] text-primary">FEATURED VIDEO</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{v.video_title}</h2>
            <p className="mt-4 text-muted-foreground">{v.video_summary}</p>
            <Button asChild size="lg" className="mt-6"><a href={v.video_url} target="_blank" rel="noopener noreferrer"><Youtube />Watch on YouTube<ArrowRight /></a></Button>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-ink shadow-xl">
            {playing && vid ? <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`} title={v.video_title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> :
              <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play ${v.video_title}`}>
                <img src={vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : videoThumb} onError={e => { e.currentTarget.src = videoThumb; }} alt="" loading="lazy" className="h-full w-full object-cover opacity-90" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="absolute left-1/2 top-1/2 grid size-18 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-ink-foreground/80 bg-ink/30 text-ink-foreground transition group-hover:scale-105"><Play className="size-8 fill-current" /></span>
                <span className="absolute bottom-4 left-5 text-left text-ink-foreground"><span className="block font-semibold">{v.video_title}</span>{v.video_duration && <span className="text-sm opacity-80">{v.video_duration}</span>}</span>
              </button>}
          </div>
        </> : <p className="lg:col-span-2 text-muted-foreground">A featured video will appear here soon.</p>}
        <aside id="quick-links" className="scroll-mt-24 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold">Quick Links</h2>
          <ul className="mt-4 divide-y">
            {data.links.map(l => { const Icon = linkIcons[l.icon as keyof typeof linkIcons] ?? Link2; return <li key={l.id}>
              <SmartLink href={l.url} className="flex items-center gap-4 py-3.5 hover:text-primary">
                <Icon className={`size-6 shrink-0 ${l.icon === 'youtube' ? 'text-destructive' : 'text-primary'}`} />
                <span className="min-w-0 flex-1"><span className="block font-semibold">{l.title}</span><span className="text-sm text-muted-foreground">{l.subtitle}</span></span>
                <ArrowRight className="size-4" />
              </SmartLink></li>; })}
            {!data.links.length && <li className="py-3 text-sm text-muted-foreground">No links yet.</li>}
          </ul>
        </aside>
      </div>
    </section>

    <section className="container-page py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="flex items-center gap-4 font-display text-3xl font-semibold sm:text-4xl">Latest Blog Articles<span className="hidden h-0.5 w-10 bg-primary sm:block" /></h2>
        <Link to="/blog" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">View All Blogs<ArrowRight className="size-4" /></Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.slice(0, term ? 12 : 4).map(p => <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
          <div className="relative">
            <img src={p.image_url || blogFallback} onError={e => { e.currentTarget.src = blogFallback; }} alt="" loading="lazy" width={960} height={600} className="aspect-[16/10] w-full object-cover" />
            <span className="absolute -bottom-3 left-4 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground shadow-sm">{p.category}</span>
          </div>
          <div className="flex flex-1 flex-col p-5 pt-6">
            <h3 className="font-display text-lg font-semibold leading-snug">{p.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />{fmt(p.published_at)}</p>
            <Link to="/blog/$slug" params={{ slug: p.slug }} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Read More<ArrowRight className="size-4" /></Link>
          </div>
        </article>)}
      </div>
      {!posts.length && <p className="py-8 text-muted-foreground">No articles match your search.</p>}
    </section>

    <section className="container-page pb-16">
      <div className="flex flex-col gap-6 rounded-2xl border bg-secondary/70 p-8 md:flex-row md:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-card text-primary"><Sprout className="size-7" /></span>
        <div className="flex-1"><h2 className="font-display text-2xl font-semibold">Stay Updated</h2><p className="mt-1 text-muted-foreground">Get the latest blogs, video updates and resources delivered to your inbox.</p></div>
        <form className="flex w-full max-w-md gap-2" onSubmit={e => { e.preventDefault(); e.currentTarget.reset(); toast.success('Thank you! You will hear from us soon.'); }}>
          <Input type="email" required aria-label="Email address" placeholder="Enter your email address" className="h-11 bg-card" />
          <Button className="h-11">Subscribe</Button>
        </form>
      </div>
    </section>
  </>;
}
