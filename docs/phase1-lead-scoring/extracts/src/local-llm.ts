export type LocalLlmConfig = {
  baseUrl: string;
  model: string;
};

/**
 * Returns the local-only model configuration.
 *
 * The default target is Ollama on localhost. No hosted LLM credentials are
 * read or required; set OLLAMA_BASE_URL only when using another self-hosted
 * Ollama-compatible endpoint.
 */
export function getLocalLlmConfig(env: NodeJS.ProcessEnv = process.env): LocalLlmConfig {
  return {
    baseUrl: (env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, ""),
    model: env.OLLAMA_MODEL || "llama3.2:3b",
  };
}

export type GenerateLocalTextInput = {
  prompt: string;
  system?: string;
  temperature?: number;
};

/** Generate text through a local Ollama server using its native HTTP API. */
export async function generateWithLocalLlm(
  input: GenerateLocalTextInput,
  options: { config?: LocalLlmConfig; fetchImpl?: typeof fetch } = {},
): Promise<string> {
  const config = options.config || getLocalLlmConfig();
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(`${config.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      prompt: input.prompt,
      system: input.system,
      stream: false,
      options: input.temperature === undefined ? undefined : { temperature: input.temperature },
    }),
  });

  if (!response.ok) {
    throw new Error(`Local Ollama request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { response?: unknown };
  if (typeof payload.response !== "string" || payload.response.trim() === "") {
    throw new Error("Local Ollama response did not contain generated text");
  }
  return payload.response;
}
