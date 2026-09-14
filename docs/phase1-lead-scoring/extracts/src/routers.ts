import { z } from "zod";
import { addOutreachEvent, approveOutreachItem, getOutreachItem, isOptedOut, listOutreachQueue, markOptOut, rejectOutreachItem } from "./db";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  outreach: router({
    queue: publicProcedure.input(z.object({ status: z.enum(["pending", "approved", "rejected", "sent", "archived"]).optional() }).default({})).query(({ input }) => listOutreachQueue(input.status)),
    approve: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const item = await getOutreachItem(input.id);
      if (!item) throw new Error("Outreach item not found");
      if (!item.recipientEmail) throw new Error("Recipient email is required before approval");
      if (await isOptedOut(item.recipientEmail)) throw new Error("This recipient has opted out");
      await approveOutreachItem(input.id);
      return { approved: true, sent: false, reason: "sending_disabled" as const };
    }),
    reject: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await rejectOutreachItem(input.id); return { rejected: true, archived: true }; }),
    optOut: publicProcedure.input(z.object({ token: z.string().min(8), email: z.string().email(), reason: z.string().max(255).optional() })).mutation(async ({ input }) => { await markOptOut(input.email, input.token, input.reason); return { success: true }; }),
    track: publicProcedure.input(z.object({ id: z.number().int().positive(), eventType: z.enum(["opened", "replied"]) })).mutation(async ({ input }) => { await addOutreachEvent(input.id, input.eventType); return { success: true }; }),
  }),
});
export type AppRouter = typeof appRouter;
