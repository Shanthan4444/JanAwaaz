// Speech Recognition Abstraction Service for JanAwaaz Multilingual Voice-First Reporting

export const getSpeechLangCode = (shortLang = 'en') => {
  if (!shortLang) return 'en-IN';
  if (shortLang.includes('-')) return shortLang;
  const lang = shortLang.toLowerCase();
  switch (lang) {
    case 'ta': return 'ta-IN'; // Tamil
    case 'te': return 'te-IN'; // Telugu
    case 'kn': return 'kn-IN'; // Kannada
    case 'hi': return 'hi-IN'; // Hindi
    case 'mr': return 'mr-IN'; // Marathi
    case 'bn': return 'bn-IN'; // Bengali
    case 'gu': return 'gu-IN'; // Gujarati
    case 'ml': return 'ml-IN'; // Malayalam
    case 'pa': return 'pa-IN'; // Punjabi
    default: return 'en-IN';   // English (India)
  }
};

/**
 * Remove immediate consecutive duplicate words (e.g. "road road" -> "road")
 */
export function cleanRepeatedWords(text) {
  if (!text) return '';
  const cleaned = text.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ');
  const resultWords = [];
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const prev = resultWords[resultWords.length - 1];
    if (prev && prev.toLowerCase() === current.toLowerCase()) {
      continue;
    }
    resultWords.push(current);
  }
  return resultWords.join(' ');
}

/**
 * Remove immediate consecutive duplicate phrases (e.g. "near the gate near the gate" -> "near the gate")
 */
export function cleanRepeatedPhrases(text) {
  if (!text) return '';
  text = cleanRepeatedWords(text);
  const words = text.split(' ');
  if (words.length < 4) return text;

  let result = [...words];
  let changed = true;

  while (changed) {
    changed = false;
    const n = result.length;
    for (let len = Math.floor(n / 2); len >= 2; len--) {
      for (let i = 0; i <= n - 2 * len; i++) {
        const p1 = result.slice(i, i + len).join(' ').toLowerCase();
        const p2 = result.slice(i + len, i + 2 * len).join(' ').toLowerCase();
        if (p1 === p2) {
          result.splice(i + len, len);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }
  return result.join(' ');
}

/**
 * Merges two transcript segments, removing overlapping words at the boundary
 */
export function mergeTranscripts(existing, addition) {
  if (!existing) return (addition || '').trim();
  if (!addition) return existing.trim();

  existing = existing.trim();
  addition = addition.trim();

  if (existing.toLowerCase() === addition.toLowerCase()) return existing;
  if (addition.toLowerCase().startsWith(existing.toLowerCase())) return addition;
  if (existing.toLowerCase().endsWith(addition.toLowerCase())) return existing;

  const existingWords = existing.split(/\s+/);
  const additionWords = addition.split(/\s+/);

  let maxOverlap = 0;
  const checkLen = Math.min(existingWords.length, additionWords.length, 6);

  for (let i = 1; i <= checkLen; i++) {
    const endSlice = existingWords.slice(-i).join(' ').toLowerCase();
    const startSlice = additionWords.slice(0, i).join(' ').toLowerCase();
    if (endSlice === startSlice) {
      maxOverlap = i;
    }
  }

  if (maxOverlap > 0) {
    const remaining = additionWords.slice(maxOverlap).join(' ');
    return remaining ? `${existing} ${remaining}`.trim() : existing;
  }

  return `${existing} ${addition}`.trim();
}

/**
 * Extracts a concise, accurate summarized title from the citizen's actual voice statement
 */
export function generateSummarizedTitle(text, category = '') {
  if (!text) return category ? `${category} Issue` : 'Civic Issue';
  let cleaned = cleanRepeatedPhrases(text.trim());
  if (!cleaned) return category ? `${category} Issue` : 'Civic Issue';

  // Split on clause delimiters: periods, question marks, commas, or common narrative conjunctions
  const delimiterRegex = /([.,!?;:\n]|(\s+(గత|గదా|దీని వల్ల|దీనివలన|కారణంగా|అందువల్ల|ఎవరైనా|because|due to|from past|for the last|since|की वजह से|पिछले|क्योंकि)\s+))/i;
  const parts = cleaned.split(delimiterRegex);
  let firstClause = (parts[0] || '').trim();

  // If first clause is a good title length (between 8 and 70 chars), use it directly!
  if (firstClause.length >= 8 && firstClause.length <= 70) {
    return firstClause;
  }

  // If short or entire string fits in 60 chars
  if (cleaned.length <= 60) return cleaned;

  // Otherwise, cut cleanly at word boundary
  const truncated = cleaned.slice(0, 60);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated).trim();
}


export class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    this.recognition = this.isSupported ? new SpeechRecognition() : null;
    this.isListening = false;
    this.shouldBeListening = false;
    this.currentTranscript = '';
    this.accumulatedText = '';
    this.currentSessionFinal = '';

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = 'en-IN';
    }
  }

  startListening({ onResult, onError, onEnd, lang = 'en' }) {
    if (!this.isSupported) {
      const err = new Error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      if (onError) onError(err);
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      const speechLang = getSpeechLangCode(lang);
      this.recognition.lang = speechLang;
      console.log(`[SPEECH SERVICE] Starting speech recognition in language: ${speechLang}`);

      this.shouldBeListening = true;
      this.isListening = true;
      this.currentTranscript = '';
      this.accumulatedText = '';
      this.currentSessionFinal = '';

      this.recognition.onresult = (event) => {
        let sessionFinal = '';
        let interimStr = '';

        // Safely iterate through all results in the current session
        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          const chunk = res[0] ? res[0].transcript : '';
          if (res.isFinal) {
            sessionFinal += chunk + ' ';
          } else {
            interimStr += chunk;
          }
        }

        sessionFinal = cleanRepeatedPhrases(sessionFinal.trim());
        interimStr = interimStr.trim();

        this.currentSessionFinal = sessionFinal;
        const combinedFinal = cleanRepeatedPhrases(mergeTranscripts(this.accumulatedText, sessionFinal));
        const fullText = cleanRepeatedPhrases((combinedFinal + (interimStr ? ' ' + interimStr : '')).trim());
        this.currentTranscript = fullText;

        if (onResult) {
          onResult({
            finalTranscript: combinedFinal,
            interimTranscript: interimStr,
            fullText: fullText
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[SPEECH SERVICE ERROR EVENT]', event.error);

        // Ignore 'no-speech' error if user just paused
        if (event.error === 'no-speech') {
          return;
        }

        let userMsg = 'Speech recognition error occurred.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          userMsg = 'Microphone permission denied. Please allow microphone access in your browser.';
          this.shouldBeListening = false;
        } else if (event.error === 'audio-capture') {
          userMsg = 'No microphone hardware detected. Please connect a microphone.';
          this.shouldBeListening = false;
        } else if (event.error === 'network') {
          userMsg = 'Voice recognition network error. Please click "Switch to Typing" below to type your report directly.';
          this.shouldBeListening = false;
        }

        if (!this.shouldBeListening) {
          this.isListening = false;
          if (onError) onError(new Error(userMsg));
        }
      };

      this.recognition.onend = () => {
        console.log('[SPEECH SERVICE] Recognition segment ended.');
        this.isListening = false;

        // Safely commit final text of ended session to accumulatedText
        if (this.currentSessionFinal) {
          this.accumulatedText = cleanRepeatedPhrases(mergeTranscripts(this.accumulatedText, this.currentSessionFinal));
          this.currentSessionFinal = '';
        }

        // Auto-restart continuously on mobile if user is still on the recording screen
        if (this.shouldBeListening) {
          console.log('[SPEECH SERVICE] Continuous listening: restarting recognition loop...');
          try {
            this.recognition.start();
            this.isListening = true;
            return;
          } catch (restartErr) {
            console.warn('[SPEECH SERVICE RESTART WARN]', restartErr);
            setTimeout(() => {
              if (this.shouldBeListening && !this.isListening) {
                try {
                  this.recognition.start();
                  this.isListening = true;
                } catch (e) {}
              }
            }, 300);
            return;
          }
        }

        if (onEnd) onEnd(this.accumulatedText || this.currentTranscript);
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('[SPEECH SERVICE START ERROR]', err);
      this.isListening = false;
      this.shouldBeListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    this.shouldBeListening = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('[SPEECH SERVICE STOP WARN]', err);
      }
      this.isListening = false;
    }

    if (this.currentSessionFinal) {
      this.accumulatedText = cleanRepeatedPhrases(mergeTranscripts(this.accumulatedText, this.currentSessionFinal));
      this.currentSessionFinal = '';
    }
    this.accumulatedText = cleanRepeatedPhrases(this.accumulatedText);
    this.currentTranscript = this.accumulatedText;
    return this.accumulatedText;
  }
}

export const speechService = new SpeechService();


