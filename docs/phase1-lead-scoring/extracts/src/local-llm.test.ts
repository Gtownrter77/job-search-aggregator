import { describe, expect, it, vi } from "vitest";
import { generateWithLocalLlm, getLocalLlmConfig } from "./local-llm";

describe("local open-source LLM adapter", () => {
  it("defaults to a local Ollama endpoint and open model", () => {
    expect(getLocalLlmConfig({})).toEqual({
      baseUrl: "http://127.0.0.1:11434",
      model: "llama3.2:3b",
    });
  });

  it("supports a self-hosted endpoint and model without API credentials", () => {
    expect(getLocalLlmConfig({
      OLLAMA_BASE_URL: "http://ollama.internal:11434/",
      OLLAMA_MODEL: "qwen2.5:7b",
      OPENAI_API_KEY: "must-not-be-read",
    })).toEqual({
      baseUrl: "http://ollama.internal:11434",
      model: "qwen2.5:7b",
    });
  });

  it("calls Ollama's local native API", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ response: "Generated locally." }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));

    await expect(generateWithLocalLlm(
      { prompt: "Write a short cover letter.", system: "Be concise.", temperature: 0.2 },
      { config: { baseUrl: "http://localhost:11434", model: "qwen2.5:7b" }, fetchImpl },
    )).resolves.toBe("Generated locally.");

    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          model: "qwen2.5:7b",
          prompt: "Write a short cover letter.",
          system: "Be concise.",
          stream: false,
          options: { temperature: 0.2 },
        }),
      }),
    );
  });
});
