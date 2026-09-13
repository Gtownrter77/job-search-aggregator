import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const matches = (job: { title: string; company: string; location: string; summary: string; tags: string[] }, q: string, location: string) => {
  const haystack = `${job.title} ${job.company} ${job.location} ${job.summary} ${job.tags.join(" ")}`.toLowerCase();
  const locationTerms = location.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return (!q || q.split(/\s+/).every(term => haystack.includes(term))) && (!location || location.toLowerCase() === "remote" || locationTerms.some(term => haystack.includes(term)));
};

type NormalizedJob = { id: string; title: string; company: string; location: string; summary: string; tags: string[]; date: string; url: string; source: string; type: string };

async function fetchRemoteOk(): Promise<NormalizedJob[]> {
  const response = await fetch("https://remoteok.com/api", { headers: { "User-Agent": "Scout job aggregator (source attribution preserved)" } });
  if (!response.ok) throw new Error(`Remote OK returned ${response.status}`);
  const data = await response.json() as Array<Record<string, unknown>>;
  return data.slice(1).filter(item => item.position && item.url).map(item => ({
    id: `remoteok-${String(item.id)}`,
    title: String(item.position), company: String(item.company || "Unknown company"), location: "Remote",
    summary: stripHtml(String(item.description || "No description provided.")), tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    date: String(item.date || ""), url: String(item.url), source: "Remote OK", type: "remote",
  }));
}

async function fetchArbeitnow(): Promise<NormalizedJob[]> {
  const response = await fetch("https://www.arbeitnow.com/api/job-board-api", { headers: { "User-Agent": "Scout job aggregator" } });
  if (!response.ok) throw new Error(`Arbeitnow returned ${response.status}`);
  const data = await response.json() as { data?: Array<Record<string, unknown>> };
  return (data.data || []).map(item => ({
    id: `arbeitnow-${String(item.slug || item.id || Math.random())}`,
    title: String(item.title || "Untitled role"), company: String(item.company_name || "Unknown company"), location: String(item.location || "See source"),
    summary: stripHtml(String(item.description || "No description provided.")), tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    date: item.created_at ? new Date(Number(item.created_at) * 1000).toISOString() : "", url: String(item.url || "https://www.arbeitnow.com/"), source: "Arbeitnow", type: String(item.job_types || ""),
  }));
}

async function fetchJobicy(): Promise<NormalizedJob[]> {
  const response = await fetch("https://jobicy.com/api/v2/remote-jobs?count=200", { headers: { "User-Agent": "Scout job aggregator" } });
  if (!response.ok) throw new Error(`Jobicy returned ${response.status}`);
  const data = await response.json() as { jobs?: Array<Record<string, unknown>> };
  return (data.jobs || []).map(item => ({
    id: `jobicy-${String(item.id)}`, title: String(item.jobTitle || "Untitled role"), company: String(item.companyName || "Unknown company"),
    location: String(item.jobGeo || "Remote"), summary: stripHtml(String(item.jobExcerpt || item.jobDescription || "No description provided.")),
    tags: [...(Array.isArray(item.jobIndustry) ? item.jobIndustry.map(String) : []), ...(Array.isArray(item.jobType) ? item.jobType.map(String) : [])], date: String(item.pubDate || ""),
    url: String(item.url || "https://jobicy.com/"), source: "Jobicy", type: Array.isArray(item.jobType) ? item.jobType.join(", ") : String(item.jobType || ""),
  }));
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  jobs: router({
    search: publicProcedure.input(z.object({ q: z.string().default(""), location: z.string().default("") })).query(async ({ input }) => {
      const results = await Promise.allSettled([fetchRemoteOk(), fetchArbeitnow(), fetchJobicy()]);
      const jobs = results.flatMap(result => result.status === "fulfilled" ? result.value : []).filter(job => matches(job, input.q.trim().toLowerCase(), input.location.trim())).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      const sources = results.map((result, index) => result.status === "fulfilled" ? ["Remote OK", "Arbeitnow", "Jobicy"][index] : null).filter(Boolean) as string[];
      return { jobs: jobs.slice(0, 100), total: jobs.length, sources };
    }),
  }),
});

export type AppRouter = typeof appRouter;
