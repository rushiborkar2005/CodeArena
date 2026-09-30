import { GoogleGenerativeAI } from '@google/generative-ai';

export const callLLM = async (messages) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API Key is missing or invalid. Please update your .env file.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Combine the structured messages into a single prompt for Gemini
    const prompt = messages.map(msg => `${msg.role.toUpperCase()}:\n${msg.content}`).join('\n\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`Failed to communicate with the Gemini API: ${error.message}`);
  }
};
