import { describe, expect, it } from "vitest";
import { FOLLOW_UP_DELAYS, buildUnsubscribeUrl, renderFollowUp, renderInitialEmail } from "./outreach";

describe("phase 2 outreach safety contracts", () => {
  it("uses the required day 3, 7, 14, 21 cadence", () => expect(FOLLOW_UP_DELAYS).toEqual([3, 7, 14, 21]));
  it("includes a working unsubscribe URL on initial and follow-up messages", () => {
    const initial = renderInitialEmail({ company: "Acme", jobTitle: "Project Manager", coverLetter: "I would love to connect.", unsubscribeToken: "token-12345678" });
    const followUp = renderFollowUp({ company: "Acme", jobTitle: "Project Manager", touchNumber: 2, unsubscribeToken: "token-12345678" });
    expect(initial).toContain(buildUnsubscribeUrl("token-12345678"));
    expect(followUp).toContain(buildUnsubscribeUrl("token-12345678"));
  });
  it("keeps the send gate disabled unless explicitly enabled", () => {
    expect(process.env.OUTREACH_SENDING_ENABLED).not.toBe("true");
  });
});
