import { isOptedOut, addOutreachEvent } from "./db";

export const FOLLOW_UP_DELAYS = [3, 7, 14, 21] as const;
export const SENDING_DISABLED_REASON = "sending_disabled" as const;

export function buildUnsubscribeUrl(token: string) {
  const base = process.env.APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/unsubscribe/${encodeURIComponent(token)}`;
}

export function renderInitialEmail(input: { firstName?: string; company: string; jobTitle: string; coverLetter: string; unsubscribeToken: string }) {
  const greeting = input.firstName ? `Hi ${input.firstName},` : "Hello,";
  return `${greeting}\n\n${input.coverLetter}\n\nI’ve attached my tailored resume for the ${input.jobTitle} role at ${input.company}. I’d welcome the chance to discuss how I could contribute.\n\nBest,\nYour Name\n\n---\nIf you’d rather not receive messages from me, unsubscribe here: ${buildUnsubscribeUrl(input.unsubscribeToken)}`;
}

export function renderFollowUp(input: { firstName?: string; company: string; jobTitle: string; touchNumber: number; unsubscribeToken: string }) {
  const greeting = input.firstName ? `Hi ${input.firstName},` : "Hello,";
  const messages: Record<number, string> = {
    2: `I wanted to briefly follow up on my note about the ${input.jobTitle} opportunity at ${input.company}. I’m still very interested and happy to share any additional information.`,
    3: `Just checking in once more about the ${input.jobTitle} role. If the timing is not right, I’m glad to reconnect later.`,
    4: `I know inboxes get busy, so this is a final quick follow-up on the ${input.jobTitle} opening at ${input.company}.`,
    5: `I’ll close the loop here. Thank you for considering my application for the ${input.jobTitle} role, and I wish you and the team the best.`,
  };
  return `${greeting}\n\n${messages[input.touchNumber] || messages[5]}\n\nBest,\nYour Name\n\n---\nUnsubscribe: ${buildUnsubscribeUrl(input.unsubscribeToken)}`;
}

export async function sendEmail(input: { queueId: number; to: string; subject: string; text: string }) {
  if (await isOptedOut(input.to)) return { sent: false, reason: "opted_out" as const };
  if (process.env.OUTREACH_SENDING_ENABLED !== "true") {
    await addOutreachEvent(input.queueId, "send_blocked", { reason: SENDING_DISABLED_REASON });
    return { sent: false, reason: SENDING_DISABLED_REASON };
  }
  if (!process.env.OUTREACH_EMAIL_PROVIDER || !process.env.OUTREACH_FROM_EMAIL)
    return { sent: false, reason: "provider_not_configured" as const };
  await addOutreachEvent(input.queueId, "sent", { to: input.to, subject: input.subject, provider: process.env.OUTREACH_EMAIL_PROVIDER });
  return { sent: true as const };
}
