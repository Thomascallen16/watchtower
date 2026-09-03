export interface ModelRequest {
  system?: string;
  input: string;
  model?: string;
  maxOutputTokens?: number;
}

export interface ModelResponse {
  output: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ModelProvider {
  id: string;
  complete(request: ModelRequest): Promise<ModelResponse>;
}

/** Provider-neutral boundary. Credentials and provider clients stay outside agent policy code. */
export class ModelGateway {
  private readonly providers = new Map<string, ModelProvider>();

  register(provider: ModelProvider): void {
    if (this.providers.has(provider.id)) throw new Error(`Model provider already registered: ${provider.id}`);
    this.providers.set(provider.id, provider);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  async complete(providerId: string, request: ModelRequest): Promise<ModelResponse> {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Unknown model provider: ${providerId}`);
    return provider.complete(request);
  }
}
