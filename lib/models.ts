// lib/models.ts
// Model registry for AI SDK - just swap the model ID!

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

export const models: Record<string, LanguageModel> = {
  // ============================================
  // OpenAI GPT-5 Base Series (400k context, 128k output)
  // ============================================
  'gpt-5': openai('gpt-5'),                    // Flagship reasoning • $1.25/$10 per 1M
  'gpt-5-mini': openai('gpt-5-mini'),          // Strong & affordable • $0.25/$2 per 1M
  'gpt-5-nano': openai('gpt-5-nano'),          // Fastest & cheapest • $0.05/$0.40 per 1M
  'gpt-5-pro': openai('gpt-5-pro'),            // Max reasoning • $15/$120 per 1M
  'gpt-5-codex': openai('gpt-5-codex'),        // Agentic coding
  'gpt-5-chat': openai.chat('gpt-5-chat-latest'),

  // ============================================
  // OpenAI GPT-5.1 Series (Adaptive Thinking, 400k context)
  // ============================================
  'gpt-5.1': openai('gpt-5.1'),                // Thinking model • $1.25/$10 per 1M
  'gpt-5.1-chat': openai.chat('gpt-5.1-chat-latest'), // Instant (fast conversational)
  'gpt-5.1-codex': openai('gpt-5.1-codex'),    // Agentic coding
  'gpt-5.1-codex-mini': openai('gpt-5.1-codex-mini'), // Smaller coding
  'gpt-5.1-codex-max': openai('gpt-5.1-codex-max'),   // Frontier long-horizon

  // ============================================
  // Anthropic Claude 4.5 Family (200k context, 64k output)
  // Note: Anthropic IDs use hyphens (4-5), Gateway uses dots (4.5)
  // ============================================
  'claude-sonnet-4.5': anthropic('claude-sonnet-4-5'),  // Smart default • $3/$15 per 1M
  'claude-opus-4.5': anthropic('claude-opus-4-5'),      // Max intelligence • $5/$25 per 1M
  'claude-haiku-4.5': anthropic('claude-haiku-4-5'),    // Fast tier • $1/$5 per 1M

  // ============================================
  // Google Gemini 3 Family
  // ============================================
  'gemini-3': google('gemini-3'),           // Google flagship
  'gemini-3-pro': google('gemini-3-pro'),   // Advanced reasoning
  'gemini-3-flash': google('gemini-3-flash'), // Fast & efficient
};

// Gateway-style model IDs (for direct gateway usage)
export const GATEWAY_MODEL_IDS = {
  // OpenAI GPT-5
  'openai/gpt-5': 'gpt-5',
  'openai/gpt-5-mini': 'gpt-5-mini',
  'openai/gpt-5-nano': 'gpt-5-nano',
  'openai/gpt-5-pro': 'gpt-5-pro',
  'openai/gpt-5-codex': 'gpt-5-codex',
  // OpenAI GPT-5.1
  'openai/gpt-5.1': 'gpt-5.1',
  'openai/gpt-5.1-chat-latest': 'gpt-5.1-chat',
  'openai/gpt-5.1-codex': 'gpt-5.1-codex',
  'openai/gpt-5.1-codex-mini': 'gpt-5.1-codex-mini',
  'openai/gpt-5.1-codex-max': 'gpt-5.1-codex-max',
  // Anthropic Claude 4.5
  'anthropic/claude-sonnet-4-5': 'claude-sonnet-4.5',
  'anthropic/claude-opus-4-5': 'claude-opus-4.5',
  'anthropic/claude-haiku-4-5': 'claude-haiku-4.5',
  // Google Gemini 3
  'google/gemini-3': 'gemini-3',
  'google/gemini-3-pro': 'gemini-3-pro',
  'google/gemini-3-flash': 'gemini-3-flash',
} as const;

// Helper to get model from gateway ID
export function getModelFromGatewayId(gatewayId: string): LanguageModel {
  const registryKey = GATEWAY_MODEL_IDS[gatewayId as keyof typeof GATEWAY_MODEL_IDS];
  return models[registryKey] ?? models['gpt-5.1-chat']; // Default to GPT-5.1 chat
}

// Model metadata for UI
export const MODEL_INFO = {
  'gpt-5': { name: 'GPT-5', context: '400k', pricing: '$1.25/$10' },
  'gpt-5-mini': { name: 'GPT-5 Mini', context: '400k', pricing: '$0.25/$2' },
  'gpt-5-nano': { name: 'GPT-5 Nano', context: '400k', pricing: '$0.05/$0.40' },
  'gpt-5-pro': { name: 'GPT-5 Pro', context: '400k', pricing: '$15/$120' },
  'gpt-5.1': { name: 'GPT-5.1 Thinking', context: '400k', pricing: '$1.25/$10' },
  'gpt-5.1-chat': { name: 'GPT-5.1 Instant', context: '400k', pricing: '$1.25/$10' },
  'claude-sonnet-4.5': { name: 'Claude Sonnet 4.5', context: '200k', pricing: '$3/$15' },
  'claude-opus-4.5': { name: 'Claude Opus 4.5', context: '200k', pricing: '$5/$25' },
  'claude-haiku-4.5': { name: 'Claude Haiku 4.5', context: '200k', pricing: '$1/$5' },
  'gemini-3': { name: 'Gemini 3', context: 'TBD', pricing: 'TBD' },
  'gemini-3-pro': { name: 'Gemini 3 Pro', context: 'TBD', pricing: 'TBD' },
  'gemini-3-flash': { name: 'Gemini 3 Flash', context: 'TBD', pricing: 'TBD' },
} as const;

