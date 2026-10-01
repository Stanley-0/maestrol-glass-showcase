import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Instagram, Mail, Pause, Play, RotateCw, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import concreteLight from "@/assets/concrete-light.jpg";
import heroImage from "@/assets/maestrol-hero.jpg";
import passageFilm from "@/assets/passage-film.jpg";
import passageReel from "@/assets/passage-reel.asset.json.asset.json";
import quietHours from "@/assets/quiet-hours.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FILM MAESTROL — Cinematic Photography & Film" },
      { name: "description", content: "FILM MAESTROL is a photography and film studio creating cinematic portraits, campaigns, editorials and films. Book your project." },
      { property: "og:title", content: "FILM MAESTROL — Cinematic Photography & Film" },
      { property: "og:description", content: "Cinematic portraits, campaigns and films by FILM MAESTROL. Photography and videography commissions now open." },
      { property: "og:site_name", content: "FILM MAESTROL" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FILM MAESTROL — Cinematic Photography & Film" },
      { name: "twitter:description", content: "Cinematic portraits, campaigns and films by FILM MAESTROL." },
      { property: "og:url", content: "https://project--21dc5731-33c5-46b6-8818-5240370d815d.lovable.app/" },
      { property: "og:image", content: "https://project--21dc5731-33c5-46b6-8818-5240370d815d.lovable.app/og-image.jpg" },
      { property: "og:image:secure_url", content: "https://project--21dc5731-33c5-46b6-8818-5240370d815d.lovable.app/og-image.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "FILM MAESTROL — cinematic photography and film" },
      { name: "twitter:image", content: "https://project--21dc5731-33c5-46b6-8818-5240370d815d.lovable.app/og-image.jpg" },
      { name: "twitter:image:alt", content: "FILM MAESTROL — cinematic photography and film" },
    ],
    links: [
      { rel: "canonical", href: "https://project--21dc5731-33c5-46b6-8818-5240370d815d.lovable.app/" },
    ],
  }),
  component: Portfolio,
});

type Category = "All" | "Photography" | "Film";

const works = [
  { title: "Quiet Hours", detail: "Editorial portrait · 2026", category: "Photography" as const, image: quietHours, width: 1088, height: 1360 },
  { title: "Passage", detail: "Fashion film · 01:06", category: "Film" as const, image: passageFilm, width: 1920, height: 1088, video: passageReel.url },
  { title: "Concrete Light", detail: "Architecture study · 2025", category: "Photography" as const, image: concreteLight, width: 768, height: 1024 },
  { title: "Edge of Weather", detail: "Environmental portrait · 2026", category: "Photography" as const, image: heroImage, width: 1920, height: 1088 },
];

function Portfolio() {
  const [filter, setFilter] = useState<Category>("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sent, setSent] = useState(false);
  const filtered = useMemo(() => works.filter((work) => filter === "All" || work.category === filter), [filter]);
  const activeWork = activeIndex === null ? null : filtered[activeIndex];
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [retries, setRetries] = useState<Record<string, number>>({});
  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (isOpen) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
      return () => { returnFocusRef.current?.focus(); };
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex === null || filtered.length < 2) return;
    [1, -1].forEach((step) => {
      const work = filtered[(activeIndex + step + filtered.length) % filtered.length];
      if (!work) return;
      const img = new Image();
      img.src = work.image;
      img.decode?.().then(() => setLoaded((s) => ({ ...s, [work.image]: true }))).catch(() => {});
    });
  }, [activeIndex, filtered]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible"));
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [filter]);

  useEffect(() => {
    if (!activeWork || activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((activeIndex + 1) % filtered.length);
      if (event.key === "ArrowLeft") setActiveIndex((activeIndex - 1 + filtered.length) % filtered.length);
      if (event.key === "Tab" && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, video[controls], [href], [tabindex]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0]!, last = items[items.length - 1]!;
        if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, activeWork, filtered.length]);

  const submitInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 px-4 md:px-10">
        <div className="glass-panel mx-auto mt-4 flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-5">
          <a href="#top" className="font-serif text-base">FILM MAESTROL</a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-foreground" href="#work">Work</a>
            <a className="transition-colors hover:text-foreground" href="#reel">Reel</a>
            <a className="transition-colors hover:text-foreground" href="#about">About</a>
          </nav>
          <Button asChild className="h-9 rounded-sm px-4 shadow-none"><a href="#inquiry">Book a project</a></Button>
        </div>
      </header>

      <section id="top" className="relative flex min-h-[94svh] items-end overflow-hidden pb-16 pt-32 md:min-h-screen md:items-center md:pb-20 md:pt-40">
        <img src={heroImage} width={1920} height={1088} alt="Cinematic portrait on a misty coast" className="hero-drift absolute inset-0 h-full w-full object-cover object-[68%_center]" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 md:px-10">
          <p className="animate-rise text-xs uppercase tracking-[0.28em] text-muted-foreground">Photography · Videography · Direction</p>
          <h1 className="animate-rise-delay mt-5 max-w-5xl font-serif text-5xl leading-[0.94] md:text-8xl lg:text-9xl">FILM MAESTROL</h1>
          <p className="animate-rise-late mt-7 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">Portraits, campaigns, and films shaped by patient observation and cinematic light.</p>
          <div className="animate-rise-late mt-9 flex flex-wrap items-center gap-5">
            <Button asChild size="lg" className="h-12 rounded-sm px-6 shadow-none"><a href="#work">View portfolio <ArrowDown /></a></Button>
            <a href="#reel" className="story-link text-sm text-foreground">Watch showreel</a>
          </div>
          <div className="glass-panel animate-rise-late mt-12 max-w-sm p-5 md:mt-16">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground"><span>Selected works</span><span>2024—26</span></div>
            <p className="mt-4 font-serif text-xl">“Stillness, in motion.”</p>
          </div>
        </div>
      </section>

      <section id="work" className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-32">
        <div data-reveal className="reveal flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div><p className="section-kicker">Portfolio / 01</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Selected work</h2></div>
          <div className="flex gap-1" role="group" aria-label="Filter portfolio">
            {(["All", "Photography", "Film"] as Category[]).map((category) => (
              <Button key={category} variant={filter === category ? "default" : "ghost"} size="sm" onClick={() => { setFilter(category); setActiveIndex(null); }} className="rounded-sm px-4 shadow-none">{category}</Button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          {filtered.map((work, index) => (
            <article data-reveal key={work.title} className={`reveal group ${index === 0 ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"}`}>
              <button className="glass-card block w-full cursor-zoom-in p-2 text-left" onClick={() => setActiveIndex(index)} aria-label={`Open ${work.title}`}>
                <div className={`relative overflow-hidden ${index === 0 ? "aspect-[4/5] lg:aspect-[5/6]" : "aspect-[4/3]"}`}>
                  <img src={work.image} width={work.width} height={work.height} loading="lazy" alt={work.title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
                  <div className="media-overlay absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-4 right-4 grid size-10 place-items-center bg-primary text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100"><ArrowUpRight /></div>
                  {work.video && <div className="absolute left-4 top-4 flex items-center gap-2 bg-background/70 px-3 py-2 text-xs uppercase tracking-[0.18em] backdrop-blur-md"><Play className="size-3" /> Film</div>}
                </div>
                <div className="flex items-start justify-between gap-4 px-2 pb-2 pt-4">
                  <div><h3 className="font-serif text-xl">{work.title}</h3><p className="mt-1 text-sm text-muted-foreground">{work.detail}</p></div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">0{index + 1}</span>
                </div>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="reel" className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-32">
        <div data-reveal className="reveal flex items-end justify-between border-b border-border pb-6">
          <div><p className="section-kicker">Motion / 02</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Showreel</h2></div>
          <span className="hidden text-xs uppercase tracking-[0.22em] text-muted-foreground sm:block">Film · 01:06</span>
        </div>
        <div data-reveal className="glass-card reveal mt-10 p-2">
          <div className="relative aspect-video overflow-hidden">
            {playing ? (
              <video src={passageReel.url} poster={passageFilm} autoPlay playsInline controls className="h-full w-full object-cover" />
            ) : (
              <img src={passageFilm} width={1920} height={1088} loading="lazy" alt="Passage showreel featuring a dancer in motion" className="h-full w-full object-cover" />
            )}
            {!playing && <Button size="icon" onClick={() => setPlaying(true)} aria-label="Play showreel" className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xl"><Play className="ml-1 size-5" /></Button>}
          </div>
          <div className="flex items-center justify-between gap-4 px-3 py-4"><p className="text-sm text-muted-foreground"><span className="font-serif text-foreground">Passage</span> — movement, light, and memory.</p><Button variant="ghost" size="icon" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause showreel" : "Play showreel"}>{playing ? <Pause /> : <Play />}</Button></div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-12">
        <div data-reveal className="reveal lg:col-span-7"><p className="section-kicker">About / 03</p><p className="mt-6 max-w-3xl font-serif text-3xl leading-snug md:text-5xl">I create images that hold still long enough to be felt—and films that let the feeling move.</p><p className="mt-7 max-w-xl leading-relaxed text-muted-foreground">FILM MAESTROL is the studio of a photographer and videographer working across portraiture, editorial, campaigns, and cinematic storytelling.</p></div>
        <div data-reveal className="glass-panel reveal self-end p-7 lg:col-span-5"><p className="section-kicker">Available for</p><div className="mt-5 grid grid-cols-2 gap-y-3 text-sm"><span>Portraits</span><span>Campaigns</span><span>Editorial</span><span>Films</span><span>Events</span><span>Creative direction</span></div></div>
      </section>

      <section id="inquiry" className="border-t border-border">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-12">
          <div data-reveal className="reveal lg:col-span-5"><p className="section-kicker">Inquiry / 04</p><h2 className="mt-5 max-w-md font-serif text-4xl leading-tight md:text-6xl">Let’s create a frame worth remembering.</h2><p className="mt-6 max-w-md text-muted-foreground">Share your idea, date, and location. Photography and videography commissions are now open.</p><div className="mt-9 flex gap-3"><Button asChild variant="outline" size="icon" aria-label="Instagram"><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram /></a></Button><Button asChild variant="outline" size="icon" aria-label="Email"><a href="mailto:studio@maestrolakai.com"><Mail /></a></Button></div></div>
          <div data-reveal className="glass-panel reveal p-6 md:p-8 lg:col-span-7">
            {sent ? <div className="flex min-h-96 flex-col items-center justify-center text-center"><p className="font-serif text-3xl">Your story is in frame.</p><p className="mt-3 text-muted-foreground">Thank you. Maestrol will be in touch shortly.</p><Button className="mt-7 rounded-sm" variant="outline" onClick={() => setSent(false)}>Send another inquiry</Button></div> :
            <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={submitInquiry}>
              <label className="field-label">Name<input required name="name" className="field" placeholder="Your name" /></label>
              <label className="field-label">Email<input required type="email" name="email" className="field" placeholder="you@example.com" /></label>
              <label className="field-label">Project<select name="project" className="field"><option>Photography</option><option>Videography</option><option>Photo + video</option><option>Creative direction</option></select></label>
              <label className="field-label">Date<input name="date" type="date" className="field" /></label>
              <label className="field-label md:col-span-2">Tell me about the project<textarea required name="message" rows={5} className="field resize-none" placeholder="The idea, location, and what you need…" /></label>
              <div className="md:col-span-2"><Button type="submit" size="lg" className="h-12 w-full rounded-sm md:w-auto">Send inquiry <ArrowUpRight /></Button></div>
            </form>}
          </div>
        </div>
      </section>

      <footer className="border-t border-border"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10"><p className="font-serif text-lg text-foreground">FILM MAESTROL</p><p>Photography & film · Available worldwide</p><p>© 2026 FILM MAESTROL</p></div></footer>

      {activeWork && activeIndex !== null && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl"
          role="dialog" aria-modal="true" aria-labelledby="viewer-title" aria-describedby="viewer-desc"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveIndex(null); }}
          onTouchStart={(e) => { touchStart.current = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY }; }}
          onTouchEnd={(e) => {
            const start = touchStart.current; touchStart.current = null;
            if (!start) return;
            const dx = e.changedTouches[0]!.clientX - start.x;
            const dy = e.changedTouches[0]!.clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) setActiveIndex((activeIndex + (dx < 0 ? 1 : -1) + filtered.length) % filtered.length);
            else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) setActiveIndex(null);
          }}
        >
          <div className="absolute left-5 top-5 z-10 text-xs uppercase tracking-[0.22em] text-muted-foreground" aria-live="polite" aria-atomic="true"><span className="sr-only">Work </span>{activeIndex + 1} <span aria-hidden="true">/</span><span className="sr-only"> of </span> {filtered.length}<span className="sr-only">: {activeWork.title}</span></div>
          <Button ref={closeRef} variant="outline" className="absolute right-4 top-4 z-10 h-11 gap-2 rounded-sm px-3" onClick={() => setActiveIndex(null)} aria-label="Close photo viewer"><X aria-hidden="true" /> <span className="hidden sm:inline" aria-hidden="true">Close</span><kbd className="hidden text-[10px] text-muted-foreground sm:inline" aria-hidden="true">ESC</kbd></Button>
          <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 z-10 hidden min-h-11 min-w-11 md:left-8 sm:inline-flex" onClick={() => setActiveIndex((activeIndex - 1 + filtered.length) % filtered.length)} aria-label={`Previous: ${filtered[(activeIndex - 1 + filtered.length) % filtered.length]?.title}`}><ChevronLeft aria-hidden="true" /></Button>
          <div className="flex max-h-[90vh] max-w-6xl flex-col items-center">
            <div className="relative grid min-h-48 min-w-48 place-items-center">
              {!activeWork.video && !loaded[activeWork.image] && !failed[activeWork.image] && (
                <div className="absolute inset-0 grid place-items-center" role="status" aria-label="Loading photo">
                  <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground motion-reduce:animate-none" />
                </div>
              )}
              {!activeWork.video && failed[activeWork.image] ? (
                <div role="alert" className="glass-panel flex w-[min(28rem,80vw)] flex-col items-center gap-4 p-8 text-center">
                  <p className="font-serif text-xl">This photo didn’t load</p>
                  <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
                  <Button variant="outline" className="rounded-sm" onClick={() => { const src = activeWork.image; setFailed((s) => ({ ...s, [src]: false })); setRetries((s) => ({ ...s, [src]: (s[src] ?? 0) + 1 })); }}><RotateCw aria-hidden="true" /> Try again</Button>
                </div>
              ) : activeWork.video ? <video key={activeWork.title} src={activeWork.video} poster={activeWork.image} autoPlay playsInline controls aria-label={`${activeWork.title} film`} className="max-h-[74vh] max-w-full" /> : (() => {
                const tries = retries[activeWork.image] ?? 0;
                const src = tries ? `${activeWork.image}${activeWork.image.includes("?") ? "&" : "?"}retry=${tries}` : activeWork.image;
                return <img key={`${activeWork.image}-${tries}`} src={src} width={activeWork.width} height={activeWork.height} alt={`${activeWork.title} — ${activeWork.detail}`} draggable={false} onLoad={() => setLoaded((s) => ({ ...s, [activeWork.image]: true }))} onError={() => { setLoaded((s) => ({ ...s, [activeWork.image]: false })); setFailed((s) => ({ ...s, [activeWork.image]: true })); }} className={`max-h-[74vh] max-w-full select-none object-contain transition-opacity duration-500 ${loaded[activeWork.image] ? "opacity-100" : "opacity-0"}`} />;
              })()}
            </div>
            <div className="mt-4 text-center"><h2 id="viewer-title" className="font-serif text-2xl">{activeWork.title}</h2><p className="mt-1 text-sm text-muted-foreground">{activeWork.detail}</p><p id="viewer-desc" className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"><span className="hidden sm:inline">← → to browse · Esc to close</span><span className="sm:hidden">Swipe to browse · swipe down to close</span></p></div>
          </div>
          <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 z-10 hidden min-h-11 min-w-11 md:right-8 sm:inline-flex" onClick={() => setActiveIndex((activeIndex + 1) % filtered.length)} aria-label={`Next: ${filtered[(activeIndex + 1) % filtered.length]?.title}`}><ChevronRight aria-hidden="true" /></Button>
        </div>
      )}
    </main>
  );
}