import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowUpRight, Bell, BriefcaseBusiness, Check, ChevronDown, Clock3, Command, Heart, LayoutDashboard, Loader2, MapPin, Menu, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

type SavedJob = { id: string; title: string; company: string; url: string };

const filters = ["All roles", "Remote only", "Full-time", "Last 24 hours"];

function formatAge(date?: string) {
  if (!date) return "Recently posted";
  const hours = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 3600000));
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export default function Home() {
  const [query, setQuery] = useState("construction management");
  const [location, setLocation] = useState("Atlanta, GA");
  const [submitted, setSubmitted] = useState({ q: "construction management", location: "Atlanta, GA" });
  const [activeFilter, setActiveFilter] = useState("All roles");
  const [saved, setSaved] = useState<SavedJob[]>(() => {
    try { return JSON.parse(localStorage.getItem("job-saved") || "[]"); } catch { return []; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const search = trpc.jobs.search.useQuery(submitted, { staleTime: 60_000 });

  const jobs = useMemo(() => {
    const data = search.data?.jobs || [];
    if (activeFilter === "Remote only") return data.filter(job => /remote|anywhere|worldwide/i.test(`${job.location} ${job.tags.join(" ")}`));
    if (activeFilter === "Full-time") return data.filter(job => /full[- ]?time/i.test(job.type || ""));
    if (activeFilter === "Last 24 hours") return data.filter(job => Date.now() - new Date(job.date || 0).getTime() < 86400000);
    return data;
  }, [activeFilter, search.data?.jobs]);

  const runSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted({ q: query.trim(), location: location.trim() });
  };

  const toggleSave = (job: SavedJob) => {
    const exists = saved.some(item => item.id === job.id);
    const next = exists ? saved.filter(item => item.id !== job.id) : [...saved, job];
    setSaved(next);
    localStorage.setItem("job-saved", JSON.stringify(next));
    toast(exists ? "Removed from saved jobs" : "Saved to your shortlist");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#152033]">
      <header className="sticky top-0 z-30 border-b border-[#e6ebf1] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-[#f0f3f7] lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation"><Menu size={20} /></button>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#182b49] text-white shadow-sm"><Sparkles size={18} /></div>
            <span className="font-[family-name:var(--font-display)] text-[21px] font-semibold tracking-[-.03em]">Scout</span>
          </div>
          <nav className={`${mobileOpen ? "absolute left-0 top-[72px] flex w-full flex-col border-b bg-white p-4" : "hidden"} gap-6 text-sm font-medium text-[#68778c] lg:flex lg:flex-row lg:items-center`}>
            <a className="text-[#1c2e49]" href="#search">Search jobs</a>
            <a href="#saved" className="hover:text-[#1c2e49]">Saved <span className="ml-1 rounded-full bg-[#e9f0fa] px-1.5 py-0.5 text-[11px] text-[#3e659a]">{saved.length}</span></a>
            <a href="#alerts" className="hover:text-[#1c2e49]">Alerts</a>
          </nav>
          <div className="flex items-center gap-3"><span className="hidden items-center gap-2 text-xs text-[#8b98aa] md:flex"><Command size={14} /> K to search</span><Button onClick={() => startLogin()} variant="outline" className="h-9 border-[#dce4ed] bg-white px-4 text-sm">Sign in</Button></div>
        </div>
      </header>

      <main id="search" className="mx-auto max-w-[1440px] px-5 pb-16 lg:px-10">
        <section className="relative overflow-hidden border-b border-[#e4eaf1] py-14 lg:py-20">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#e8f1ff] blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dce7f4] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-[#6684aa]"><span className="h-1.5 w-1.5 rounded-full bg-[#58a27c]" /> Live job intelligence</div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-.05em] text-[#152033] sm:text-6xl">Your next move,<br /><span className="text-[#6c87aa]">without the noise.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#718096]">Search fresh Atlanta-area openings across construction management, project delivery, and sales in one focused workspace. Save the roles worth your time, then move with intent.</p>
          </div>
          <form onSubmit={runSearch} className="relative mt-10 grid gap-2 rounded-2xl border border-[#dbe3ec] bg-white p-2 shadow-[0_16px_40px_rgba(26,47,78,.08)] lg:grid-cols-[1.4fr_1fr_auto]">
            <label className="flex items-center gap-3 rounded-xl px-4 py-3 focus-within:bg-[#f7f9fc]"><Search className="text-[#8da0b7]" size={19} /><Input value={query} onChange={e => setQuery(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" placeholder="Role, skills, or company" /></label>
            <label className="flex items-center gap-3 rounded-xl px-4 py-3 focus-within:bg-[#f7f9fc]"><MapPin className="text-[#8da0b7]" size={19} /><Input value={location} onChange={e => setLocation(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" placeholder="Location or remote" /></label>
            <Button type="submit" className="h-12 rounded-xl bg-[#182b49] px-7 text-white hover:bg-[#243e63]">Search roles <ArrowUpRight className="ml-2" size={17} /></Button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#8795a8]"><span>Try:</span>{["construction management", "sales", "project manager"].map(item => <button key={item} onClick={() => { setQuery(item); setSubmitted({ q: item, location }); }} className="rounded-full border border-[#e0e7ef] bg-white px-3 py-1.5 hover:border-[#afc2da] hover:text-[#3c5e87]">{item}</button>)}</div>
        </section>

        <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[.14em] text-[#91a0b1]"><LayoutDashboard size={14} /> Search results</div><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-.03em]">Fresh opportunities for you</h2></div><div className="flex items-center gap-2 text-xs text-[#8391a3]">{search.isFetching ? <><Loader2 className="animate-spin" size={14} /> Updating sources</> : <><span className="h-1.5 w-1.5 rounded-full bg-[#58a27c]" /> {search.data?.total || 0} live results</>}</div></div>
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">{filters.map(filter => <button key={filter} onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium transition ${activeFilter === filter ? "bg-[#182b49] text-white" : "border border-[#e0e7ef] bg-white text-[#748297] hover:border-[#b8c8dc]"}`}>{filter}</button>)}<button className="ml-auto hidden items-center gap-2 rounded-full border border-[#e0e7ef] bg-white px-3.5 py-2 text-xs font-medium text-[#748297] sm:flex"><SlidersHorizontal size={14} /> Filters <ChevronDown size={13} /></button></div>
            <div className="mt-5 space-y-3">
              {search.isLoading && <div className="rounded-2xl border border-[#e2e8ef] bg-white p-10 text-center text-sm text-[#8997a9]"><Loader2 className="mx-auto mb-3 animate-spin" />Fetching live listings…</div>}
              {search.isError && <div className="rounded-2xl border border-[#efd8d5] bg-[#fffaf9] p-8 text-center"><p className="font-medium text-[#8d504b]">The live sources didn’t respond.</p><p className="mt-1 text-sm text-[#a97570]">Try again in a moment; no placeholder listings are shown.</p><Button onClick={() => search.refetch()} variant="outline" className="mt-4 border-[#e9c9c5] bg-white text-[#8d504b]"><RefreshCw size={14} className="mr-2" /> Retry</Button></div>}
              {!search.isLoading && !search.isError && jobs.length === 0 && <div className="rounded-2xl border border-dashed border-[#ced9e5] bg-white p-12 text-center"><Search className="mx-auto mb-3 text-[#a2b0c0]" /><p className="font-medium">No live roles matched this search.</p><p className="mt-1 text-sm text-[#8997a9]">Try a broader title, skill, or location.</p></div>}
              {jobs.map((job, index) => { const isSaved = saved.some(item => item.id === job.id); return <article key={job.id} className="group rounded-2xl border border-[#e2e8ef] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#b9cbe0] hover:shadow-[0_12px_30px_rgba(28,54,87,.08)] sm:p-6"><div className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf3fb] font-[family-name:var(--font-display)] text-sm font-semibold text-[#54769f]">{job.company.slice(0, 2).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-[-.02em] text-[#1b2d46]">{job.title}</h3><p className="mt-1 text-sm text-[#718096]">{job.company} <span className="px-1 text-[#c0c9d4]">·</span> {job.location || "Remote"}</p></div><button onClick={() => toggleSave({ id: job.id, title: job.title, company: job.company, url: job.url })} className={`rounded-lg p-2 transition ${isSaved ? "bg-[#edf4ff] text-[#3e6fa8]" : "text-[#a8b5c4] hover:bg-[#f2f5f9] hover:text-[#58789e]"}`} aria-label={isSaved ? "Unsave job" : "Save job"}>{isSaved ? <Check size={18} /> : <Heart size={18} />}</button></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-[#6f7f93]">{job.summary}</p><div className="mt-4 flex flex-wrap items-center gap-2">{job.tags.slice(0, 4).map(tag => <Badge key={tag} variant="secondary" className="rounded-md bg-[#f3f6f9] px-2 py-1 text-[11px] font-medium text-[#77879a]">{tag}</Badge>)}<span className="ml-auto flex items-center gap-1.5 text-[11px] text-[#9aa7b5]"><Clock3 size={13} /> {formatAge(job.date)}</span></div></div></div><div className="mt-5 flex items-center justify-between border-t border-[#eef1f4] pt-4"><span className="text-[11px] font-medium uppercase tracking-[.12em] text-[#a1adba]">{job.source}</span><a href={job.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3d6592] hover:text-[#1d4777]">View original <ArrowUpRight size={14} /></a></div></article> })}
            </div>
          </section>

          <aside className="space-y-4 lg:pt-10">
            <div id="saved" className="rounded-2xl border border-[#dfe7ef] bg-[#eef4fb] p-5"><div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#52759e]"><Heart size={17} /></div><span className="text-xs font-semibold text-[#6784a5]">{saved.length} saved</span></div><h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-.02em]">Build your shortlist</h3><p className="mt-2 text-sm leading-6 text-[#71859e]">Save roles from live sources as you go. Your shortlist stays in this browser until you sign in.</p><a href="#saved" className="mt-4 inline-flex text-xs font-semibold text-[#3f6795]">View saved jobs <ArrowUpRight className="ml-1" size={14} /></a></div>
            <div id="alerts" className="rounded-2xl border border-[#e2e8ef] bg-white p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[#8a99aa]"><Bell size={14} /> Job alerts</div><h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-.02em]">Never miss the right one.</h3><p className="mt-2 text-sm leading-6 text-[#7b899b]">Sign in to turn this search into a daily alert and keep your applications organized.</p><Button onClick={() => startLogin()} className="mt-5 w-full bg-[#182b49] text-white hover:bg-[#243e63]">Create an alert</Button></div>
            <div className="rounded-2xl border border-[#e2e8ef] bg-white p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[#8a99aa]"><BriefcaseBusiness size={14} /> Sources</div><div className="mt-4 space-y-3 text-sm text-[#697b91]">{(search.data?.sources || ["Remote OK", "Arbeitnow", "Jobicy"]).map(source => <div className="flex items-center justify-between" key={source}><span>{source}</span><span className="flex items-center gap-1.5 text-[11px] text-[#639276]"><span className="h-1.5 w-1.5 rounded-full bg-[#63a07a]" /> live</span></div>)}</div><p className="mt-4 border-t border-[#eef1f4] pt-4 text-[11px] leading-5 text-[#9aa6b4]">Listings open on their original source. Scout does not copy or submit applications.</p></div>
          </aside>
        </div>
      </main>
      <footer className="border-t border-[#e4eaf1] bg-white"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-xs text-[#92a0af] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>Scout · focused job discovery</span><span>Live listings only · source links preserved</span></div></footer>
    </div>
  );
}
