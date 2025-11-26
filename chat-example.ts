import { streamText } from 'ai';
import 'dotenv/config';
import { config } from 'dotenv';
import * as readline from 'readline';

config({ path: '.env.local' });

const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

async function chat(userMessage: string): Promise<string> {
  conversationHistory.push({ role: 'user', content: userMessage });

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    messages: conversationHistory,
    system: 'You are a helpful AI assistant specialized in digital advertising and marketing. Be concise but informative.',
  });

  let fullResponse = '';
  
  process.stdout.write('\n🤖 ');
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
    fullResponse += textPart;
  }
  console.log('\n');

  conversationHistory.push({ role: 'assistant', content: fullResponse });
  
  return fullResponse;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       🚀 AI Gateway Chat - Advertising Assistant 🚀        ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Type your message and press Enter to chat.                ║');
  console.log('║  Type "exit" to quit.                                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (): void => {
    rl.question('👤 You: ', async (input) => {
      const userInput = input.trim();
      
      if (userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!\n');
        rl.close();
        return;
      }

      if (!userInput) {
        prompt();
        return;
      }

      try {
        await chat(userInput);
      } catch (error) {
        console.error('Error:', error);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);

