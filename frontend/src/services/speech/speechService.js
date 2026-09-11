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

export class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    this.recognition = this.isSupported ? new SpeechRecognition() : null;
    this.isListening = false;
    this.shouldBeListening = false;
    this.currentTranscript = '';
    this.finalTranscript = '';
    this.restartAttempts = 0;
    this.maxRestartAttempts = 3;

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
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
      this.finalTranscript = '';
      this.accumulatedText = '';
      this.restartAttempts = 0;

      this.recognition.onresult = (event) => {
        let sessionFinal = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            sessionFinal += chunk + ' ';
          } else {
            interimStr += chunk;
          }
        }

        if (sessionFinal) {
          this.accumulatedText = (this.accumulatedText + ' ' + sessionFinal).trim();
        }

        this.currentTranscript = (this.accumulatedText + ' ' + interimStr).trim();

        if (onResult) {
          onResult({
            finalTranscript: this.accumulatedText,
            interimTranscript: interimStr.trim(),
            fullText: this.currentTranscript
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[SPEECH SERVICE ERROR EVENT]', event.error);

        // Ignore 'no-speech' error if user just paused, do not crash UI or exit
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

        // Auto-restart continuously as long as user is on the listening screen
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

        if (onEnd) onEnd(this.currentTranscript);
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
    return this.currentTranscript;
  }
}

export const speechService = new SpeechService();

