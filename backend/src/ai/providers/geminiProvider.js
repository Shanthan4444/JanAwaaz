import { SYSTEM_PROMPT, buildUserPrompt, PROMPT_VERSION } from '../prompts/issueAnalysisPrompt.js';
import { validateIssueAnalysisSchema } from '../schemas/issueAnalysisSchema.js';

export const geminiProvider = {
  name: 'Google Gemini API (Primary Vision & Multimodal)',
  modelName: 'gemini-3.6-flash',

  analyzeIssue: async (issueData) => {
    // Gather all configured Gemini API keys (GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4, GEMINI_API_KEY_5)
    const envKeyList = Object.keys(process.env)
      .filter((k) => k.startsWith('GEMINI_API_KEY'))
      .map((k) => process.env[k]);

    const rawKeys = [
      ...envKeyList,
      ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [])
    ].filter((k) => k && typeof k === 'string' && k.trim() !== '');

    // Deduplicate keys
    const apiKeys = [...new Set(rawKeys.map((k) => k.trim()))];

    if (apiKeys.length === 0) {
      throw new Error('[Gemini Provider] No GEMINI_API_KEY is configured in backend environment variables.');
    }

    let lastError = null;
    const candidateModels = [
      process.env.GEMINI_VISION_MODEL,
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.6-flash'
    ].filter((m) => m && typeof m === 'string' && m.trim() !== '');

    const uniqueModels = [...new Set(candidateModels)];

    // Try each API key and model combination
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];

      for (const model of uniqueModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
          const parts = [
            { text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(issueData)}` }
          ];

          // Add Multimodal Photo Evidence (base64 data URLs or HTTP/HTTPS image URLs)
          if (Array.isArray(issueData.evidence) && issueData.evidence.length > 0) {
            for (const item of issueData.evidence) {
              const imgSrc = typeof item === 'string' ? item : item?.url;
              if (typeof imgSrc === 'string' && imgSrc.trim() !== '') {
                if (imgSrc.startsWith('data:image/')) {
                  const matches = imgSrc.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
                  if (matches && matches.length === 3) {
                    parts.push({
                      inlineData: {
                        mimeType: matches[1],
                        data: matches[2]
                      }
                    });
                  }
                } else if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
                  try {
                    const imgController = new AbortController();
                    const imgTimeout = setTimeout(() => imgController.abort(), 5000);
                    const imgRes = await fetch(imgSrc, { signal: imgController.signal });
                    clearTimeout(imgTimeout);
                    if (imgRes.ok) {
                      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                      const mimeType = contentType.split(';')[0].trim() || 'image/jpeg';
                      const buffer = await imgRes.arrayBuffer();
                      const base64Data = Buffer.from(buffer).toString('base64');
                      parts.push({
                        inlineData: {
                          mimeType,
                          data: base64Data
                        }
                      });
                    }
                  } catch (imgError) {
                    console.warn(`[GEMINI WARN] Failed to fetch HTTP image evidence: ${imgError.message}`);
                  }
                }
              }
            }
          }

          const payload = {
            contents: [
              {
                role: 'user',
                parts
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1
            }
          };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        let response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          const errorText = await response.text();
          const status = response.status;

          if (status === 404) {
            console.warn(`[GEMINI KEY ${i + 1}/${apiKeys.length} WARN] HTTP 404: Gemini model endpoint not found.`);
            lastError = new Error(`Gemini Model Endpoint Not Found (HTTP 404)`);
            continue;
          } else if (status === 401 || status === 403) {
            console.warn(`[GEMINI KEY ${i + 1}/${apiKeys.length} WARN] HTTP ${status}: Invalid or unauthorized key.`);
            lastError = new Error(`Gemini Authentication Error (HTTP ${status})`);
            continue;
          } else if (status === 429) {
            console.warn(`[GEMINI KEY ${i + 1}/${apiKeys.length} WARN] HTTP 429: Rate limit quota exceeded. Moving to next key...`);
            lastError = new Error(`Gemini Rate Limit Exceeded (HTTP 429)`);
            continue;
          } else if (status === 503) {
            console.warn(`[GEMINI KEY ${i + 1}/${apiKeys.length} WARN] HTTP 503: Service temporarily unavailable.`);
            lastError = new Error(`Gemini Service Unavailable (HTTP 503)`);
            continue;
          } else {
            console.warn(`[GEMINI KEY ${i + 1}/${apiKeys.length} WARN] HTTP ${status}: Gemini API server error.`);
            lastError = new Error(`Gemini API Error (HTTP ${status})`);
            continue;
          }
        }

        const resJson = await response.json();
        const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          lastError = new Error('Gemini API returned an empty candidate text response.');
          continue;
        }

        const parsed = JSON.parse(rawText);
        const validated = validateIssueAnalysisSchema(parsed);

        console.log(`[GEMINI SUCCESS] Successfully processed via Key #${i + 1}`);
        return {
          ...validated,
          provider: 'gemini-vision',
          model: model,
          promptVersion: PROMPT_VERSION,
          status: 'ANALYZED'
        };
      } catch (error) {
        if (error.name === 'AbortError') {
          lastError = new Error(`Gemini Key #${i + 1} call timed out after 15000ms`);
        } else {
          lastError = error;
        }
        console.warn(`[GEMINI KEY ${i + 1}/${apiKeys.length} / MODEL ${model} ERROR] ${error.message}. Trying next available model/key...`);
      }
    }
  }

  throw lastError || new Error('All configured Gemini API keys in rotation pool failed.');
}
};
