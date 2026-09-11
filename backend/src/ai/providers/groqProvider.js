import { SYSTEM_PROMPT, buildUserPrompt, PROMPT_VERSION } from '../prompts/issueAnalysisPrompt.js';
import { validateIssueAnalysisSchema } from '../schemas/issueAnalysisSchema.js';

export const groqProvider = {
  name: 'Groq API (Fallback)',
  modelName: 'deepseek-r1-distill-llama-70b',

  analyzeIssue: async (issueData) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('[Groq Provider] GROQ_API_KEY is not configured in backend environment variables.');
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const payload = {
        model: process.env.GROQ_MODEL || 'groq/compound',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(issueData) }
        ],
        temperature: 0.2
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq HTTP API error (${response.status}): ${errorText}`);
      }

      const resJson = await response.json();
      const rawText = resJson?.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error('Groq API returned an empty completion content.');
      }

      const parsed = JSON.parse(rawText);

      // Groq is a text-only LLM. If a photo evidence was attached, Groq CANNOT visually verify it.
      const hasPhoto = Array.isArray(issueData.evidence) && issueData.evidence.length > 0;
      if (hasPhoto && parsed.isCivicIssue === true) {
        parsed.isCivicIssue = false;
        parsed.evidenceStatus = 'INVALID_EVIDENCE';
        parsed.consistency = 'UNKNOWN';
        parsed.category = 'UNCONFIRMED';
        parsed.department = 'NOT ASSIGNED';
        parsed.severity = 'N/A';
        parsed.priority = 0;
        parsed.reasoning = 'Photo evidence attached but visual AI verification was unavailable. Please re-verify or upload a clear photo.';
      }

      const validated = validateIssueAnalysisSchema(parsed);

      return {
        ...validated,
        provider: 'groq',
        model: process.env.GROQ_MODEL || 'groq/compound',
        promptVersion: PROMPT_VERSION,
        status: 'ANALYZED'
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Groq API call timed out after 10000ms');
      }
      throw error;
    }
  }
};
