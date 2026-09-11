import { SYSTEM_PROMPT, buildUserPrompt, PROMPT_VERSION } from '../prompts/issueAnalysisPrompt.js';
import { validateIssueAnalysisSchema } from '../schemas/issueAnalysisSchema.js';

export const featherlessProvider = {
  name: 'Featherless AI VLM (Primary Multimodal Engine)',

  analyzeIssue: async (issueData) => {
    // Collect Featherless API keys from environment
    const rawKeys = [
      process.env.FEATHERLESS_API_KEY,
      process.env.FEATHERLESS_API_KEY_2,
      process.env.FEATHERLESS_API_KEY_3,
      process.env.FEATHERLESS_API_KEY_4,
      process.env.FEATHERLESS_API_KEY_5,
      ...(process.env.FEATHERLESS_API_KEYS ? process.env.FEATHERLESS_API_KEYS.split(',') : [])
    ];

    const apiKeys = [...new Set(rawKeys.map((k) => k && k.trim()).filter((k) => k && k.length > 0))];

    if (apiKeys.length === 0) {
      throw new Error('[Featherless Provider] FEATHERLESS_API_KEY is not configured in backend environment variables.');
    }

    const modelName = process.env.FEATHERLESS_VISION_MODEL || process.env.QWEN_MODEL || 'Qwen/Qwen3-VL-30B-A3B-Instruct';
    const endpoint = process.env.FEATHERLESS_API_URL || 'https://api.featherless.ai/v1/chat/completions';

    let lastError = null;

    for (let i = 0; i < apiKeys.length; i++) {
      const currentApiKey = apiKeys[i];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const userContent = [
          { type: 'text', text: buildUserPrompt(issueData) }
        ];

        // Add Multimodal Photo Evidence if base64 or URL images are provided
        if (Array.isArray(issueData.evidence) && issueData.evidence.length > 0) {
          issueData.evidence.forEach((img) => {
            const imgSrc = typeof img === 'string' ? img : img?.url;
            if (typeof imgSrc === 'string' && imgSrc.trim() !== '') {
              if (imgSrc.startsWith('data:image/') || imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
                userContent.push({
                  type: 'image_url',
                  image_url: { url: imgSrc }
                });
              }
            }
          });
        }

        const payload = {
          model: modelName,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent }
          ],
          temperature: 0.2
        };

        console.log(`[FEATHERLESS] Sending request via Key #${i + 1}/${apiKeys.length} to model ${modelName}`);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentApiKey}`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`[FEATHERLESS KEY #${i + 1} WARN] HTTP ${response.status}: ${errorText}`);
          lastError = new Error(`Featherless API Error (HTTP ${response.status}): ${errorText}`);
          continue; // Try next key
        }

        const resJson = await response.json();
        let rawText = resJson?.choices?.[0]?.message?.content;

        if (!rawText || typeof rawText !== 'string') {
          lastError = new Error('Featherless API returned an empty or invalid content payload.');
          continue;
        }

        // Strip markdown code block formatting if returned by model
        let cleanedText = rawText.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }

        const parsed = JSON.parse(cleanedText);
        const validated = validateIssueAnalysisSchema(parsed);

        console.log(`[FEATHERLESS SUCCESS] Analysis completed successfully via Key #${i + 1}`);

        return {
          ...validated,
          provider: 'featherless',
          model: modelName,
          promptVersion: PROMPT_VERSION,
          status: 'ANALYZED'
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          lastError = new Error(`Featherless Key #${i + 1} call timed out after 20000ms`);
        } else {
          lastError = error;
        }
        console.warn(`[FEATHERLESS KEY #${i + 1} ERROR] ${error.message}. Trying next available key...`);
      }
    }

    throw lastError || new Error('All configured Featherless API keys failed.');
  },

  // Dedicated Semantic Voice Validation via Featherless LLM (Qwen3-VL)
  validateVoiceSemantic: async (voiceText) => {
    const rawKeys = [
      process.env.FEATHERLESS_API_KEY,
      process.env.FEATHERLESS_API_KEY_2,
      process.env.FEATHERLESS_API_KEY_3,
      process.env.FEATHERLESS_API_KEY_4,
      process.env.FEATHERLESS_API_KEY_5,
      ...(process.env.FEATHERLESS_API_KEYS ? process.env.FEATHERLESS_API_KEYS.split(',') : [])
    ];

    const apiKeys = [...new Set(rawKeys.map((k) => k && k.trim()).filter((k) => k && k.length > 0))];

    if (apiKeys.length === 0) {
      throw new Error('[Featherless Provider] FEATHERLESS_API_KEY is not configured in backend environment variables.');
    }

    const modelName = process.env.FEATHERLESS_VISION_MODEL || process.env.QWEN_MODEL || 'Qwen/Qwen3-VL-30B-A3B-Instruct';
    const endpoint = process.env.FEATHERLESS_API_URL || 'https://api.featherless.ai/v1/chat/completions';

    const systemPrompt = `You are a strict civic issue validation assistant.

Your ONLY task is to determine whether the user's spoken statement (in any language, including English, Telugu, Hindi, Tamil, Kannada, Marathi, Bengali, Gujarati, Malayalam, etc.) describes a genuine public/civic issue that could reasonably be reported to a municipal/local government/civic authority.

Do not classify personal problems, casual conversation, birthday wishes, greetings, college problems, academic problems, relationship problems, emotional conversations, general questions, jokes, or unrelated content as civic issues.

Do not infer a civic issue when the evidence is insufficient.

A civic issue must involve a public place, public infrastructure, public service, sanitation, roads, drainage, waste management, water supply, street lighting, public safety, or another legitimate civic concern.

If the user gives an unclear statement, ask for clarification.

If the user gives personal information, do not treat that information as the civic complaint. Politely ask them to describe only the civic issue and avoid unnecessary personal details.

Be conservative. When uncertain, set is_civic_issue to false.

Return JSON ONLY matching this exact JSON schema:
{
  "is_civic_issue": boolean,
  "is_clear": boolean,
  "contains_personal_information": boolean,
  "category": "ROAD_DAMAGE" | "GARBAGE" | "WATER_LEAKAGE" | "ELECTRICAL_HAZARD" | "DRAINAGE" | "STREETLIGHT" | "FIRE_HAZARD" | "PUBLIC_INFRASTRUCTURE" | null,
  "confidence": number,
  "issue_summary": string or null,
  "reason": string,
  "response_to_user": string
}`;

    const userPrompt = `Transcribed Spoken Statement to Validate:
"${voiceText}"`;

    let lastError = null;

    for (let i = 0; i < apiKeys.length; i++) {
      const currentApiKey = apiKeys[i];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        console.log(`[VOICE AI REQUEST] Sending transcription to Featherless AI (${modelName}) via Key #${i + 1}...`);
        console.log(`[VOICE AI INPUT] "${voiceText}"`);

        const payload = {
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentApiKey}`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`[VOICE AI ERROR] HTTP ${response.status}: ${errorText}`);
          lastError = new Error(`Featherless API Error (HTTP ${response.status}): ${errorText}`);
          continue;
        }

        const resJson = await response.json();
        let rawText = resJson?.choices?.[0]?.message?.content;

        if (!rawText || typeof rawText !== 'string') {
          lastError = new Error('Featherless API returned an empty or invalid content payload.');
          continue;
        }

        let cleanedText = rawText.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }

        const parsed = JSON.parse(cleanedText);
        console.log(`[VOICE AI RESPONSE] Received structured result from Featherless LLM:`, JSON.stringify(parsed, null, 2));

        return parsed;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          lastError = new Error(`Featherless Key #${i + 1} call timed out after 20000ms`);
        } else {
          lastError = error;
        }
        console.warn(`[VOICE AI ERROR] ${error.message}`);
      }
    }

    throw lastError || new Error('All configured Featherless API keys failed for voice validation.');
  },

  // Dedicated Multimodal Photo Evidence Validation via Featherless VLM (Qwen3-VL)
  validatePhotoSemantic: async ({ voiceText, category, issueSummary, image }) => {
    const rawKeys = [
      process.env.FEATHERLESS_API_KEY,
      process.env.FEATHERLESS_API_KEY_2,
      process.env.FEATHERLESS_API_KEY_3,
      process.env.FEATHERLESS_API_KEY_4,
      process.env.FEATHERLESS_API_KEY_5,
      ...(process.env.FEATHERLESS_API_KEYS ? process.env.FEATHERLESS_API_KEYS.split(',') : [])
    ];

    const apiKeys = [...new Set(rawKeys.map((k) => k && k.trim()).filter((k) => k && k.length > 0))];

    if (apiKeys.length === 0) {
      throw new Error('[Featherless Provider] FEATHERLESS_API_KEY is not configured in backend environment variables.');
    }

    const modelName = process.env.FEATHERLESS_VISION_MODEL || process.env.QWEN_MODEL || 'Qwen/Qwen3-VL-30B-A3B-Instruct';
    const endpoint = process.env.FEATHERLESS_API_URL || 'https://api.featherless.ai/v1/chat/completions';

    const systemPrompt = `You are a strict civic evidence verification assistant.

Your ONLY task is to determine whether the uploaded photograph provides genuine visual evidence supporting the SPECIFIC civic issue described by the user.

You have:
1. The user's voice transcription.
2. The civic issue category.
3. The issue summary.
4. The uploaded photograph.

Compare the photograph against the reported issue.

STRICT VALIDATION RULES:
1. Do NOT accept an image merely because it is a real photograph, a picture of a road, a building, a room, a person, a selfie, food, a pet, or a general scene.
2. The photograph must provide reasonable visual evidence relevant to the SPECIFIC reported issue.
3. If the photograph clearly depicts a different object or civic issue than reported (e.g. user reported a broken streetlight, but the photo shows a pothole or garbage), set photo_relevant to false and issue_match to false.
4. If the photograph is too unclear, too dark, extremely blurry, obstructed, blank, or corrupted to verify the reported issue, set image_quality_sufficient to false.
5. Be conservative. When uncertain, set photo_relevant to false.

Return JSON ONLY matching this exact JSON schema:
{
  "photo_relevant": boolean,
  "issue_match": boolean,
  "image_quality_sufficient": boolean,
  "confidence": number,
  "detected_visual_issue": string or null,
  "reported_issue": string,
  "category_match": boolean,
  "reason": string,
  "user_message": string
}`;

    const userPromptText = `User Reported Voice Description: "${voiceText || 'Civic issue'}"
Category: "${category || 'Road Damage'}"
Issue Summary: "${issueSummary || voiceText || ''}"

Please analyze the attached image and determine whether it provides visual evidence matching the reported civic issue.`;

    const userContent = [
      { type: 'text', text: userPromptText }
    ];

    if (image && typeof image === 'string' && image.trim() !== '') {
      userContent.push({
        type: 'image_url',
        image_url: { url: image }
      });
    }

    let lastError = null;

    for (let i = 0; i < apiKeys.length; i++) {
      const currentApiKey = apiKeys[i];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        console.log(`[PHOTO AI REQUEST] Sending image & voice context to Featherless AI (${modelName}) via Key #${i + 1}...`);
        console.log(`[PHOTO AI INPUT VOICE] "${voiceText}" | Category: "${category}"`);

        const payload = {
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          temperature: 0.1
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentApiKey}`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`[PHOTO AI ERROR] HTTP ${response.status}: ${errorText}`);
          lastError = new Error(`Featherless API Error (HTTP ${response.status}): ${errorText}`);
          continue;
        }

        const resJson = await response.json();
        let rawText = resJson?.choices?.[0]?.message?.content;

        if (!rawText || typeof rawText !== 'string') {
          lastError = new Error('Featherless API returned an empty or invalid content payload.');
          continue;
        }

        let cleanedText = rawText.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }

        const parsed = JSON.parse(cleanedText);
        console.log(`[PHOTO AI RESPONSE] Received structured result from Featherless VLM:`, JSON.stringify(parsed, null, 2));

        return parsed;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          lastError = new Error(`Featherless Key #${i + 1} call timed out after 25000ms`);
        } else {
          lastError = error;
        }
        console.warn(`[PHOTO AI ERROR] ${error.message}`);
      }
    }

    throw lastError || new Error('All configured Featherless API keys failed for photo validation.');
  }
};
