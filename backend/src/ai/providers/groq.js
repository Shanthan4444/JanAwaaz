/**
 * Groq API Fallback Provider
 */
export const groqProvider = {
  name: 'Groq API (Fallback)',
  analyzeIssue: async (issueData) => {
    // Contract definition for future integration
    throw new Error('Groq Provider unconfigured in Phase 0 Architecture');
  }
};
