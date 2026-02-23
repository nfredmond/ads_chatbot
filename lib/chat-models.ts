export type ModelProvider = 'openai' | 'anthropic' | 'google';
export type ModelTier = 'recommended' | 'frontier' | 'balanced' | 'fast';

export interface ChatModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  tier: ModelTier;
}

export const CHAT_MODELS: ChatModelOption[] = [
  // Recommended default (strong, lower cost than absolute frontier)
  {
    id: 'anthropic/claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    description: 'Recommended default: strong quality at lower cost than frontier tier',
    tier: 'recommended',
  },
  // Premium frontier options
  {
    id: 'anthropic/claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    description: 'Premium frontier: highest Claude reasoning quality',
    tier: 'frontier',
  },
  {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    description: 'Premium frontier: top-tier OpenAI reasoning',
    tier: 'frontier',
  },
  {
    id: 'google/gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    description: 'Premium frontier: advanced long-context and multimodal reasoning',
    tier: 'frontier',
  },
  // Balanced / fast options
  {
    id: 'openai/gpt-5.2-mini',
    name: 'GPT-5.2 Mini',
    provider: 'openai',
    description: 'Balanced: strong quality with lower latency/cost',
    tier: 'balanced',
  },
  {
    id: 'google/gemini-3.1-flash',
    name: 'Gemini 3.1 Flash',
    provider: 'google',
    description: 'Fast: lower-latency, cost-efficient Google option',
    tier: 'fast',
  },
];

export const DEFAULT_CHAT_MODEL = 'anthropic/claude-sonnet-4-6';

// Backward compatibility for previously saved UI values.
export const MODEL_ID_ALIASES: Record<string, string> = {
  'anthropic/claude-sonnet-4-5': 'anthropic/claude-sonnet-4-6',
  'anthropic/claude-opus-4-5': 'anthropic/claude-opus-4-6',
  'anthropic/claude-haiku-4-5': 'anthropic/claude-sonnet-4-6',
  'anthropic/claude-sonnet-4': 'anthropic/claude-sonnet-4-6',

  'openai/gpt-5': 'openai/gpt-5.2',
  'openai/gpt-5-mini': 'openai/gpt-5.2-mini',
  'openai/gpt-5-nano': 'openai/gpt-5.2-mini',
  'openai/gpt-5-pro': 'openai/gpt-5.2',
  'openai/gpt-5-codex': 'openai/gpt-5.2',
  'openai/gpt-5.1': 'openai/gpt-5.2',
  'openai/gpt-5.1-chat-latest': 'openai/gpt-5.2-mini',
  'openai/gpt-5.1-codex': 'openai/gpt-5.2',
  'openai/gpt-5.1-codex-mini': 'openai/gpt-5.2-mini',
  'openai/gpt-5.1-codex-max': 'openai/gpt-5.2',

  'google/gemini-3': 'google/gemini-3.1-pro',
  'google/gemini-3-pro': 'google/gemini-3.1-pro',
  'google/gemini-3-flash': 'google/gemini-3.1-flash',
};

const SUPPORTED_MODEL_ID_SET = new Set(CHAT_MODELS.map((model) => model.id));

export function normalizeModelId(modelId: string | null | undefined): string {
  const resolved = modelId ? (MODEL_ID_ALIASES[modelId] ?? modelId) : DEFAULT_CHAT_MODEL;
  return SUPPORTED_MODEL_ID_SET.has(resolved) ? resolved : DEFAULT_CHAT_MODEL;
}

export function getGatewayModelId(modelId: string | null | undefined): string {
  return normalizeModelId(modelId);
}
