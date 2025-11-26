import { streamText } from 'ai';
import 'dotenv/config';

// Load from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  console.log('🚀 Starting AI Gateway Experiment...\n');

  const result = streamText({
    model: 'openai/gpt-4o-mini',  // Using gpt-4o-mini for testing (cheaper than gpt-5)
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  console.log('📝 AI Response:\n');
  
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log('\n');
  console.log('📊 Token usage:', await result.usage);
  console.log('✅ Finish reason:', await result.finishReason);
}

main().catch(console.error);

