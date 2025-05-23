export function isGreeting(message: string): boolean {
  // Convert to lowercase and trim
  const normalizedMessage = message.toLowerCase().trim();

  // List of common greetings
  const greetings = [
    'hi', 'hii', 'hello', 'hey', 'greetings', 'sup', 'yo',
    'good morning', 'good afternoon', 'good evening',
    'howdy', 'what\'s up', 'whats up', 'hiya', 'heya',
    'how are you', 'how r u', 'how are ya', 'how\'s it going',
    'how is it going', 'how are things', 'what\'s new'
  ];

  // Check if the message matches or starts with any greeting
  return greetings.some(greeting =>
    normalizedMessage === greeting ||
    normalizedMessage.startsWith(`${greeting} `) ||
    normalizedMessage.startsWith(`${greeting}!`) ||
    normalizedMessage.startsWith(`${greeting}?`)
  );
}

// Function to generate a conversational response for greetings
export async function generateConversationalResponse(message: string): Promise<string> {
  if (isGreeting(message)) {
    const responses = [
      "Hello! I'm ATS-Lite, your recruiting assistant. How can I help you find candidates today? For example, you can ask for 'Frontend Engineers in Germany' or 'Experienced developers with React skills'.",
      "Hi there! I can help you search through candidate profiles. Try asking something like 'Show me backend developers with at least 5 years of experience' or 'Find Python developers willing to relocate'.",
      "Greetings! I'm here to help with your candidate search. Could you provide some search criteria? For example: 'Developers with cloud experience' or 'Mobile developers with the highest salaries'."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  return "";
}