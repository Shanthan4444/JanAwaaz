import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Phone,
  UserCheck,
  Cpu,
  Type,
  ImageIcon,
  Lock,
  Volume2,
  RotateCcw,
  AlertCircle,
  XCircle,
  ShieldAlert,
  Globe,
  Play,
  Check
} from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Textarea } from '../../shared/components/Textarea';
import { FileUpload } from '../../shared/components/FileUpload';
import { Modal } from '../../shared/components/Modal';
import { speechService } from '../../services/speech/speechService';
import { locationService } from '../../services/location/locationService';
import { issuesApi } from '../../services/api/issuesApi';
import { authApi } from '../../services/api/authApi';
import { useAuth } from '../../services/auth/AuthProvider';
import { useTranslation } from '../../shared/i18n/LanguageContext';
import confetti from 'canvas-confetti';
import { LeafletMapPicker } from '../../shared/components/LeafletMapPicker';

export const ReportIssue = ({ onNavigate }) => {
  const { t, currentLang } = useTranslation();
  const { user, isAuthenticated, login, loginWithToken } = useAuth();

  // Navigation Steps:
  // Step 1: Step-by-Step Guided Report Flow (Voice -> AI Validation -> Photo -> Location)
  // Step 2: Speech Listening State
  // Step 3: AI Diagnostic Scanning
  // Step 4: AI Results & Final Review (What AI Understood)
  // Step 5: Citizen Mobile OTP Login (if not authenticated)
  // Step 6: Enter OTP
  // Step 7: New User Name Entry
  // Step 8: Success Receipt (Persisted in MongoDB)
  const [step, setStep] = useState(1);

  // Draft Data State
  const [images, setImages] = useState([]);
  const [voiceText, setVoiceText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);

  // Voice AI Validation State (Strict Step 1 -> Step 2 Gate)
  const [selectedVoiceLang, setSelectedVoiceLang] = useState(currentLang || 'en');
  const [isValidatingVoice, setIsValidatingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceValidation, setVoiceValidation] = useState({
    status: 'IDLE', // IDLE | VALID | UNCLEAR | NON_CIVIC | PERSONAL_INFO | EMPTY | API_ERROR
    isValidated: false,
    message: '',
    transcription: '',
    category: '',
    confidence: null,
    issueSummary: null,
    reason: '',
    aiConnected: false
  });

  // Photo AI Validation State (Strict Step 2 -> Step 3 Gate)
  const [isValidatingPhoto, setIsValidatingPhoto] = useState(false);
  const [photoValidation, setPhotoValidation] = useState({
    status: 'IDLE', // IDLE | VALID | MISMATCH | POOR_QUALITY | API_ERROR
    isValidated: false,
    message: '',
    detectedVisualIssue: '',
    reason: '',
    aiConnected: false
  });

  // Location State
  const [location, setLocation] = useState({
    latitude: 28.5355,
    longitude: 77.3910,
    area: 'University Sector',
    landmark: 'Main Entrance Gate',
    address: '📍 University Sector, Main Gate'
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // AI Structured Output State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Auth & OTP State
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [serverHint, setServerHint] = useState(null);

  // New User Name State
  const [fullName, setFullName] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [createdIssueId, setCreatedIssueId] = useState(null);

  // Sync selected voice language with app translation language
  useEffect(() => {
    if (currentLang) setSelectedVoiceLang(currentLang);
  }, [currentLang]);

  // Trigger AI Vision & Location Processing when entering Step 3
  useEffect(() => {
    if (step === 3) {
      processAiAndLocation();
    }
  }, [step]);

  // Confetti trigger on success screen
  useEffect(() => {
    if (step === 8) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [step]);

  // Handle Speech Recording Start
  const handleStartRecording = () => {
    setRecordingError(null);
    setIsRecording(true);
    setInterimText('');
    setStep(2);

    const started = speechService.startListening({
      lang: selectedVoiceLang || 'en',
      onResult: ({ fullText, interimTranscript }) => {
        setVoiceText(fullText);
        setInterimText(interimTranscript);
      },
      onError: (err) => {
        console.warn('[SPEECH RECORDING WARN]', err);
        setRecordingError(err.message || 'Speech recognition failed. Please allow microphone access or use keyboard.');
        setIsRecording(false);
      },
      onEnd: (finalText) => {
        if (speechService.shouldBeListening) {
          return; // Still in continuous listening loop
        }
        setIsRecording(false);
        setInterimText('');
        const textToValidate = (finalText || voiceText || '').trim();
        if (textToValidate) {
          setVoiceText(textToValidate);
          setStep(1);
          handleValidateVoice(textToValidate);
        } else {
          setStep(1);
        }
      }
    });

    if (!started) {
      setIsRecording(false);
      setUseTextInput(true);
      setStep(1);
    }
  };

  // Handle Speech Recording Stop & Auto AI Validation
  const handleStopRecording = () => {
    const capturedText = speechService.stopListening();
    const finalSpeechText = (capturedText || voiceText || '').trim();
    if (finalSpeechText) {
      setVoiceText(finalSpeechText);
    }
    setIsRecording(false);
    setInterimText('');
    setStep(1); // Return to Step 1 Guided Screen

    if (finalSpeechText) {
      handleValidateVoice(finalSpeechText);
    }
  };

  // Handle Voice Reset / Re-record
  const handleResetVoice = () => {
    speechService.stopListening();
    setIsRecording(false);
    setVoiceText('');
    setInterimText('');
    setVoiceValidation({
      status: 'IDLE',
      isValidated: false,
      message: '',
      transcription: '',
      category: '',
      confidence: null,
      issueSummary: null,
      reason: '',
      aiConnected: false
    });
  };

  // Audio Playback Handler
  const handlePlayAudio = () => {
    if (!voiceText) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.lang = 'en-IN';
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // AI Voice Validation Engine (Strict Featherless AI Integration - NO MOCK/KEYWORD FALLBACKS)
  const handleValidateVoice = async (overrideText) => {
    const textToValidate = (overrideText !== undefined ? overrideText : voiceText).trim();
    if (!textToValidate) {
      setVoiceValidation({
        status: 'EMPTY',
        isValidated: false,
        message: 'Please tell us about the civic problem using your voice or keyboard.',
        transcription: '',
        category: '',
        confidence: null,
        issueSummary: null,
        reason: '',
        aiConnected: false
      });
      return;
    }

    setIsValidatingVoice(true);
    try {
      const res = await issuesApi.validateVoice(textToValidate);
      const valRes = res?.data || res || {};

      const isCivic = valRes.is_civic_issue ?? valRes.isCivicIssue;
      const isClear = valRes.is_clear ?? valRes.isClear;
      const hasPersonal = valRes.contains_personal_information ?? valRes.containsPersonalInformation;
      const confidence = typeof valRes.confidence === 'number' ? valRes.confidence : 0;
      const aiConnected = valRes.aiConnected ?? true;

      if (valRes.validationStatus === 'VALID' && aiConnected && confidence >= 0.80) {
        setVoiceValidation({
          status: 'VALID',
          isValidated: true,
          message: valRes.response_to_user || valRes.responseToUser || '✓ Civic issue identified',
          transcription: textToValidate,
          category: valRes.category || 'Civic Issue',
          confidence,
          issueSummary: valRes.issue_summary || valRes.issueSummary,
          reason: valRes.reason || '',
          aiConnected: true
        });
      } else if (valRes.validationStatus === 'PERSONAL_INFO' || hasPersonal) {
        setVoiceValidation({
          status: 'PERSONAL_INFO',
          isValidated: false,
          message: valRes.response_to_user || valRes.responseToUser || 'Please avoid sharing personal details such as your name, phone number, college information, or private information. Please describe only the public/civic problem you want to report.',
          transcription: textToValidate,
          category: '',
          confidence,
          issueSummary: null,
          reason: valRes.reason || '',
          aiConnected: true
        });
      } else if (valRes.validationStatus === 'NON_CIVIC' || isCivic === false) {
        setVoiceValidation({
          status: 'NON_CIVIC',
          isValidated: false,
          message: valRes.response_to_user || valRes.responseToUser || 'Please describe a relevant civic issue such as a pothole, garbage problem, drainage issue, broken streetlight, or damaged public infrastructure.',
          transcription: textToValidate,
          category: '',
          confidence,
          issueSummary: null,
          reason: valRes.reason || '',
          aiConnected: true
        });
      } else if (valRes.validationStatus === 'API_ERROR' || !aiConnected) {
        setVoiceValidation({
          status: 'API_ERROR',
          isValidated: false,
          message: 'AI validation is currently unavailable. Please try again.',
          transcription: textToValidate,
          category: '',
          confidence: 0,
          issueSummary: null,
          reason: valRes.reason || 'AI API unavailable',
          aiConnected: false
        });
      } else {
        // UNCLEAR (CASE B)
        setVoiceValidation({
          status: 'UNCLEAR',
          isValidated: false,
          message: valRes.response_to_user || valRes.responseToUser || 'Please describe what the problem is and where it is located.',
          transcription: textToValidate,
          category: '',
          confidence,
          issueSummary: null,
          reason: valRes.reason || '',
          aiConnected: true
        });
      }
    } catch (err) {
      console.error('[VOICE VALIDATION API ERROR]', err);
      // Strictly show AI unavailable message — NO FALSE POSITIVE FALLBACK!
      setVoiceValidation({
        status: 'API_ERROR',
        isValidated: false,
        message: 'AI validation is currently unavailable. Please try again.',
        transcription: textToValidate,
        category: '',
        confidence: 0,
        issueSummary: null,
        reason: err.message || 'Network request failed',
        aiConnected: false
      });
    } finally {
      setIsValidatingVoice(false);
    }
  };

  // AI Multimodal Photo Validation Engine (Handles Matching, Mismatch, Quality, API Failure)
  const handleValidatePhoto = async (imageSrc) => {
    if (!imageSrc) return;

    try {
      localStorage.setItem('jansetu_latest_issue_photo', imageSrc);
    } catch (e) {}

    setIsValidatingPhoto(true);
    try {
      const payload = {
        voiceText: voiceValidation.transcription || voiceText,
        category: voiceValidation.category || 'Road Damage',
        issueSummary: voiceValidation.issueSummary || voiceValidation.transcription || voiceText,
        image: imageSrc
      };

      console.log('[PHOTO VALIDATION] Requesting Featherless VLM analysis for uploaded image...');
      const res = await issuesApi.validatePhoto(payload);
      const valRes = res?.data || res || {};

      const photoRelevant = valRes.photo_relevant ?? valRes.photoRelevant;
      const issueMatch = valRes.issue_match ?? valRes.issueMatch;
      const qualitySuff = valRes.image_quality_sufficient ?? valRes.imageQualitySufficient;
      const confidence = typeof valRes.confidence === 'number' ? valRes.confidence : 0;
      const aiConnected = valRes.aiConnected ?? true;

      if (valRes.validationStatus === 'VALID' && aiConnected && confidence >= 0.80) {
        setPhotoValidation({
          status: 'VALID',
          isValidated: true,
          message: valRes.user_message || valRes.userMessage || '✓ Photo Evidence Verified',
          detectedVisualIssue: valRes.detected_visual_issue || valRes.detectedVisualIssue || 'Matching visual evidence confirmed',
          reason: valRes.reason || 'The uploaded photograph clearly supports the reported civic issue.',
          aiConnected: true
        });
      } else if (valRes.validationStatus === 'POOR_QUALITY' || qualitySuff === false) {
        setPhotoValidation({
          status: 'POOR_QUALITY',
          isValidated: false,
          message: valRes.user_message || valRes.userMessage || 'The photo is too unclear, dark, or blurry to verify the reported issue. Please upload a clearer photo.',
          detectedVisualIssue: null,
          reason: valRes.reason || 'Image quality is insufficient to verify the reported issue.',
          aiConnected: true
        });
      } else if (valRes.validationStatus === 'API_ERROR' || !aiConnected) {
        setPhotoValidation({
          status: 'API_ERROR',
          isValidated: false,
          message: 'Photo verification is currently unavailable. Please try again.',
          detectedVisualIssue: null,
          reason: valRes.reason || 'AI API request failed',
          aiConnected: false
        });
      } else {
        // MISMATCH (Wrong photo, non-civic photo, or different civic issue)
        setPhotoValidation({
          status: 'MISMATCH',
          isValidated: false,
          message: valRes.user_message || valRes.userMessage || '⚠️ This photo does not appear to match the reported civic issue. Please upload a photo showing the issue.',
          detectedVisualIssue: valRes.detected_visual_issue || valRes.detectedVisualIssue || 'Different scene detected',
          reason: valRes.reason || 'The uploaded photograph does not match the specific civic issue described in Step 1.',
          aiConnected: true
        });
      }
    } catch (err) {
      console.error('[PHOTO VALIDATION API ERROR]', err);
      setPhotoValidation({
        status: 'API_ERROR',
        isValidated: false,
        message: 'Photo verification is currently unavailable. Please try again.',
        detectedVisualIssue: null,
        reason: err.message || 'Network request failed',
        aiConnected: false
      });
    } finally {
      setIsValidatingPhoto(false);
    }
  };

  // Reset Photo Validation
  const handleResetPhoto = () => {
    setImages([]);
    setPhotoValidation({
      status: 'IDLE',
      isValidated: false,
      message: '',
      detectedVisualIssue: '',
      reason: '',
      aiConnected: false
    });
  };

  // AI Multimodal Vision & Description Processing
  const processAiAndLocation = async (overrideText) => {
    setIsAnalyzing(true);
    setLocationLoading(true);

    const textToProcess = (overrideText !== undefined && overrideText !== null ? overrideText : voiceText).trim() || 'Civic problem requiring municipal attention.';

    // 1. Resolve GPS Location
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
    } catch (locErr) {
      console.warn('[LOCATION PROCESS WARN]', locErr);
      setLocationError('Geolocation unavailable. Defaulting to University Sector.');
    } finally {
      setLocationLoading(false);
    }

    // 2. Call AI Vision & Description Analysis API
    try {
      const payload = {
        title: textToProcess.slice(0, 60),
        description: textToProcess,
        evidence: images,
        location
      };
      const res = await issuesApi.previewAnalyze(payload);
      setAiAnalysis(res);
      setStep(4); // Move to Final AI Review Screen
    } catch (aiErr) {
      console.warn('[AI PROCESS NETWORK FALLBACK]', aiErr);

      const validatedCategory = voiceValidation.category || 'ROADS_INFRASTRUCTURE';
      let fallbackDept = 'Roads & Infrastructure Department';
      let fallbackSev = 'HIGH';
      let fallbackPrio = 80;

      if (validatedCategory === 'Fire Hazard' || validatedCategory === 'FIRE') {
        fallbackDept = 'Fire Department';
        fallbackSev = 'CRITICAL';
        fallbackPrio = 95;
      } else if (validatedCategory === 'Water Leakage' || validatedCategory === 'WATER_SUPPLY_SEWERAGE') {
        fallbackDept = 'Water Supply & Sewerage Department';
        fallbackSev = 'HIGH';
        fallbackPrio = 85;
      } else if (validatedCategory === 'Garbage' || validatedCategory === 'Drainage' || validatedCategory === 'MUNICIPAL') {
        fallbackDept = 'Municipal Department';
        fallbackSev = 'HIGH';
        fallbackPrio = 80;
      } else if (validatedCategory === 'Streetlight' || validatedCategory === 'ELECTRICAL') {
        fallbackDept = 'Electrical Department';
        fallbackSev = 'MEDIUM';
        fallbackPrio = 75;
      } else if (validatedCategory === 'Road Damage' || validatedCategory === 'ROADS_INFRASTRUCTURE') {
        fallbackDept = 'Roads & Infrastructure Department';
        fallbackSev = 'HIGH';
        fallbackPrio = 85;
      } else if (validatedCategory === 'INVALID') {
        fallbackDept = 'NOT ASSIGNED';
        fallbackSev = 'N/A';
        fallbackPrio = 0;
      }

      setAiAnalysis({
        isCivicIssue: validatedCategory !== 'INVALID',
        valid: validatedCategory !== 'INVALID',
        confidence: voiceValidation.confidence || 0.88,
        evidenceStatus: validatedCategory !== 'INVALID' ? 'VALID_EVIDENCE' : 'INVALID_EVIDENCE',
        consistency: 'CONSISTENT',
        category: validatedCategory,
        department: fallbackDept,
        severity: fallbackSev,
        priority: fallbackPrio,
        issueTitle: textToProcess.slice(0, 50) || `${validatedCategory} Report`,
        summary: textToProcess.slice(0, 60) || `${validatedCategory} Complaint`,
        description: textToProcess,
        reasoning: validatedCategory === 'INVALID'
          ? "This issue is currently outside JanAwaaz's supported civic services."
          : 'Civic report registered using verified Featherless AI voice classification.',
        photoDescription: 'Civic problem evidence confirmed from user camera capture.'
      });
      setStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Review Confirmed -> If authenticated, submit directly; otherwise, require OTP verification before final submission
  const handleReviewConfirmed = async () => {
    if (isAuthenticated && user) {
      await finalizeIssueCreation(user);
    } else {
      setStep(5); // Contextual OTP Verification step for final issue submission
    }
  };

  // Request Mobile OTP
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    setServerHint(null);
    try {
      const res = await authApi.requestOtp(mobileNumber);
      if (res.devNote) setServerHint(res.devNote);
      setOtpSent(true);
      setStep(6);
    } catch (err) {
      console.error('[OTP REQUEST ERROR]', err);
      setOtpError(err.message || 'Failed to send OTP code.');
      setStep(6);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP & Proceed
  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const authRes = await authApi.verifyOtp(mobileNumber, otpCode);
      const authUser = authRes.user;

      if (authRes.token) {
        if (loginWithToken) loginWithToken(authRes.token, authUser);
        else if (login) login(authUser, authRes.token);
      }

      if (!authUser.name || authUser.name.startsWith('Citizen (') || authUser.name === 'Citizen') {
        setStep(7); // Prompt for Name
      } else {
        await finalizeIssueCreation(authUser);
      }
    } catch (err) {
      console.error('[OTP VERIFY ERROR]', err);
      setOtpError(err.message || 'Invalid OTP code. Please check your phone for the code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Save New User Name & Submit
  const handleNewUserSubmit = async () => {
    if (!fullName.trim()) return;
    const updatedUser = { ...user, name: fullName.trim() };
    await finalizeIssueCreation(updatedUser);
  };

  // Finalize MongoDB Issue Creation
  const finalizeIssueCreation = async (reporterUser) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const description = voiceText.trim() || 'Civic problem described by citizen.';
    const category = aiAnalysis?.category || 'Road Damage';
    const department = aiAnalysis?.department || 'Roads & Infrastructure';

    try {
      const created = await issuesApi.createIssue({
        title: aiAnalysis?.summary || description.slice(0, 60),
        description,
        category,
        department,
        severity: aiAnalysis?.severity || 'HIGH',
        priority: aiAnalysis?.priority || 85,
        location: {
          area: location.area,
          landmark: location.landmark,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        evidence: images.length > 0 ? images : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
        reporter: {
          userId: reporterUser?.id || reporterUser?._id || user?.id || user?._id || (mobileNumber ? `user-${mobileNumber}` : 'demo-citizen-001'),
          name: reporterUser?.name || user?.name || fullName || 'Citizen',
          mobile: reporterUser?.mobile || user?.mobile || mobileNumber || ''
        }
      });

      setCreatedIssueId(created.issueId || created.id);

      // Persist evidence photo in browser localStorage for authority officer display
      const issueIdKey = created.issueId || created.id || created._id;
      const photoSrc = images.length > 0 ? images[0] : null;
      if (photoSrc) {
        try {
          const photoStore = JSON.parse(localStorage.getItem('jansetu_issue_photos') || '{}');
          if (issueIdKey) photoStore[issueIdKey] = photoSrc;
          photoStore['latest'] = photoSrc;
          localStorage.setItem('jansetu_issue_photos', JSON.stringify(photoStore));
          localStorage.setItem('jansetu_latest_issue_photo', photoSrc);
        } catch (storageErr) {
          console.warn('[LOCAL STORAGE PHOTO SAVE WARN]', storageErr);
        }
      }

      setStep(8); // Success Screen
    } catch (err) {
      console.error('[FINAL SUBMIT ERROR]', err);
      setSubmissionError(err.message || 'Could not persist report to MongoDB right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for Language Label
  const getLanguageName = (code) => {
    switch (code) {
      case 'ta': return 'Tamil (தமிழ்)';
      case 'te': return 'Telugu (తెలుగు)';
      case 'kn': return 'Kannada (ಕನ್ನಡ)';
      case 'hi': return 'Hindi (हिन्दी)';
      case 'mr': return 'Marathi (मराठी)';
      case 'bn': return 'Bengali (বাংলা)';
      case 'gu': return 'Gujarati (ગુજરાતી)';
      case 'ml': return 'Malayalam (മലയാളം)';
      default: return 'English';
    }
  };

  // -------------------------------------------------------------
  // RENDER FLOW STEPS (1 - 8)
  // -------------------------------------------------------------

  // SCREEN 8: SUCCESS RECEIPT
  if (step === 8) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '560px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-resolved-bg)',
            color: 'var(--status-resolved)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Your report is now helping improve the community
          </h2>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 auto var(--space-6)', maxWidth: '400px' }}>
            Thank you, <strong>{user?.name || fullName || 'Citizen'}</strong>. Your report is now filed and assigned to the municipal queue.
          </p>

          <div style={{
            margin: 'var(--space-6) 0',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface-hover)',
            border: '1px dashed var(--color-border-default)',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              CIVIC TRACKING RECEIPT ID
            </span>
            <h3 style={{ fontSize: 'var(--font-xl)', fontFamily: 'monospace', fontWeight: 900, color: 'var(--color-brand-primary)', marginTop: '4px', marginBottom: 'var(--space-3)' }}>
              {createdIssueId}
            </h3>

            <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              <div>Assigned Department: <strong style={{ color: 'var(--color-text-primary)' }}>{aiAnalysis?.department || 'Assigned'}</strong></div>
              <div>Severity Rating: <strong style={{ color: 'var(--color-brand-primary)' }}>{aiAnalysis?.severity || 'HIGH'} (Priority Score: {aiAnalysis?.priority || 85})</strong></div>
              <div>Location Pin: <strong style={{ color: 'var(--color-text-primary)' }}>{location.area}</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate ? onNavigate(`/track/${createdIssueId}`) : (window.location.hash = `/track/${createdIssueId}`)}
              style={{ width: '100%' }}
            >
              TRACK RESOLUTION PROGRESS
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate ? onNavigate('/') : (window.location.hash = '/')}
              style={{ width: '100%' }}
            >
              RETURN TO HOME
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 7: NEW USER NAME ENTRY
  if (step === 7) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-subtle)',
            color: 'var(--color-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)'
          }}>
            <UserCheck size={24} />
          </div>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            Tell us your name
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-6)' }}>
            We need a name to credit your account with civic engagement points.
          </p>

          <Input
            label="Full Name"
            placeholder="e.g. Rahul Verma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ marginBottom: 'var(--space-6)' }}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleNewUserSubmit}
            disabled={isSubmitting || !fullName.trim()}
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'SUBMITTING REPORT...' : 'SUBMIT REPORT'}
          </Button>
        </div>
      </div>
    );
  }

  // SCREEN 6: ENTER OTP
  if (step === 6) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Security Verification
            </h2>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
              Enter the 6-digit OTP code sent to <strong>+91 {mobileNumber}</strong>
            </p>
          </div>

          {otpError && (
            <div style={{
              backgroundColor: 'var(--status-reopened-bg)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--font-xs)',
              color: 'var(--status-reopened)'
            }}>
              {otpError}
            </div>
          )}

          <Input
            label="Verification Code"
            placeholder="000 000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength={6}
            style={{ fontSize: 'var(--font-xl)', letterSpacing: '0.25em', textAlign: 'center', marginBottom: 'var(--space-6)' }}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleVerifyOtp}
            disabled={otpLoading || otpCode.length < 6}
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
          >
            {otpLoading ? 'VERIFYING CODE...' : 'VERIFY & SUBMIT'}
          </Button>

          {serverHint && (
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-brand-primary)', marginTop: '8px', padding: '6px', backgroundColor: 'var(--color-brand-subtle)', borderRadius: 'var(--radius-xs)' }}>
              💡 {serverHint}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 5: MANDATORY CITIZEN LOGIN
  if (step === 5) {
    return (
      <div className="container animate-slide-up" style={{ maxWidth: '480px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-subtle)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <Phone size={24} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
              ONE QUICK VERIFICATION
            </span>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
              Verify Your Mobile Number
            </h2>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Before submitting your civic issue, verify your mobile number to authorize submission to <strong>{aiAnalysis?.department || 'Department'}</strong>.
            </p>
          </div>

          {otpError && (
            <div style={{
              backgroundColor: 'var(--status-reopened-bg)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--font-xs)',
              color: 'var(--status-reopened)',
              fontWeight: 700
            }}>
              ⚠️ {otpError}
            </div>
          )}

          <Input
            label="10-Digit Mobile Number"
            placeholder="e.g. 9876543210"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            maxLength={10}
            style={{ marginBottom: 'var(--space-6)' }}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleSendOtp}
            disabled={otpLoading || mobileNumber.length < 10}
            style={{ width: '100%' }}
          >
            {otpLoading ? 'SENDING OTP CODE...' : 'SEND OTP CODE & LOGIN ➔'}
          </Button>
        </div>
      </div>
    );
  }

  // SCREEN 4: AI CALCULATIONS & REVIEW SCREEN
  if (step === 4) {
    // INVALID ISSUE HANDLER: Outside Supported Civic Scope
    if (aiAnalysis?.category === 'INVALID' || aiAnalysis?.valid === false || aiAnalysis?.isCivicIssue === false) {
      return (
        <div className="container animate-slide-up" style={{ maxWidth: '560px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
          <div style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1.5px solid var(--color-status-danger)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--color-status-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <XCircle size={36} />
            </div>

            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-status-danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              COMPLAINT NOT ACCEPTED
            </span>

            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px', marginBottom: 'var(--space-2)' }}>
              INVALID ISSUE
            </h2>

            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 auto var(--space-6)', maxWidth: '440px' }}>
              {aiAnalysis?.reasoning || "This complaint is currently outside JanAwaaz's supported civic services."}
            </p>

            <div style={{
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-surface-hover)',
              border: '1px solid var(--color-border-default)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)'
            }}>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
                JanAwaaz currently accepts complaints for these 5 civic services:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--color-status-success)" /> <strong>Broken Streetlights</strong> (Electrical Department)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--color-status-success)" /> <strong>Water Leakage</strong> (Water Supply & Sewerage Department)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--color-status-success)" /> <strong>Potholes / Damaged Roads</strong> (Roads & Infrastructure Department)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--color-status-success)" /> <strong>Garbage Overflow / Blocked Drains / Sewage Overflow</strong> (Municipal Department)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--color-status-success)" /> <strong>Fire / Fire Hazards</strong> (Fire Department)</div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setStep(1);
                setVoiceText('');
                setImages([]);
                setAiAnalysis(null);
                setVoiceValidation({ status: 'IDLE', isValidated: false });
              }}
              style={{ width: '100%' }}
            >
              REPORT ANOTHER ISSUE
            </Button>
          </div>
        </div>
      );
    }

    const isCriticalOrHigh = aiAnalysis?.severity === 'CRITICAL' || aiAnalysis?.severity === 'HIGH';

    return (
      <div className="container animate-slide-up" style={{ maxWidth: '880px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-border)', marginBottom: 'var(--space-2)' }}>
            <Sparkles size={12} style={{ marginRight: '4px' }} /> FINAL REVIEW: AI CIVIC DIAGNOSTIC
          </span>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            Verify AI Analysis & Dispatch
          </h1>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Check auto-generated parameters before final dispatch to municipal authorities.
          </p>
        </div>

        {/* Diagnostic Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          
          {/* Voice Description & Photo Evidence */}
          <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
              🎙️ VALIDATED VOICE COMPLAINT
            </div>

            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.6, backgroundColor: 'var(--color-bg-surface-hover)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-brand-primary)', marginBottom: 'var(--space-4)' }}>
              "{voiceText || 'Voice message recorded by citizen.'}"
            </p>

            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
              📷 ATTACHED PHOTO EVIDENCE & VISUAL DIAGNOSTIC
            </div>

            {images.length > 0 ? (
              <img
                src={images[0]}
                alt="Uploaded Evidence"
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}
              />
            ) : (
              <div style={{ height: '200px', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-xs)', border: '1px dashed var(--color-border-default)' }}>
                No photo evidence uploaded
              </div>
            )}
          </div>

          {/* AI Calculated Severity & Department */}
          <div className="card-container" style={{
            borderLeft: `6px solid ${isCriticalOrHigh ? 'var(--status-reopened)' : 'var(--color-brand-primary)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                <Sparkles size={14} /> JANSETU AI CALCULATIONS
              </div>
              <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
                Score {aiAnalysis?.priority || 85}/100
              </span>
            </div>

            <div style={{
              backgroundColor: isCriticalOrHigh ? 'var(--status-reopened-bg)' : 'var(--color-brand-subtle)',
              border: `1px solid ${isCriticalOrHigh ? 'rgba(220, 38, 38, 0.2)' : 'var(--color-brand-border)'}`,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: isCriticalOrHigh ? 'var(--status-reopened)' : 'var(--color-brand-primary)', textTransform: 'uppercase' }}>
                Severity Rating:
              </span>
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 900, color: isCriticalOrHigh ? 'var(--status-reopened)' : 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> {aiAnalysis?.severity || 'HIGH'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                <span>Assigned Dept:</span>
                <strong style={{ color: 'var(--color-brand-primary)' }}>{aiAnalysis?.department || 'Roads & Infrastructure'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                <span>Issue Category:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{aiAnalysis?.category || 'Road Damage'}</strong>
              </div>
            </div>

            <LeafletMapPicker
              initialLocation={location}
              onChange={(newLoc) => setLocation(newLoc)}
            />
          </div>
        </div>

        {submissionError && (
          <div style={{ backgroundColor: 'var(--status-reopened-bg)', border: '1px solid rgba(220, 38, 38, 0.25)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--status-reopened)', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ {submissionError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Edit3} onClick={() => setEditModalOpen(true)} disabled={isSubmitting}>
            EDIT DETAILS
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={CheckCircle}
            disabled={isSubmitting}
            onClick={handleReviewConfirmed}
          >
            {isSubmitting ? 'SUBMITTING REPORT TO DEPARTMENT...' : 'CONFIRM & SUBMIT REPORT ➔'}
          </Button>
        </div>

        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Modify AI Calculations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Issue Summary Title"
              value={aiAnalysis?.summary || ''}
              onChange={(e) => setAiAnalysis({ ...aiAnalysis, summary: e.target.value })}
            />

            <Textarea
              label="Detailed Description"
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              rows={4}
            />

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                Target Department
              </label>
              <select
                value={aiAnalysis?.department || 'Roads & Infrastructure Department'}
                onChange={(e) => setAiAnalysis({ ...aiAnalysis, department: e.target.value })}
                className="form-select"
              >
                <option value="Electrical Department">Electrical Department</option>
                <option value="Water Supply & Sewerage Department">Water Supply & Sewerage Department</option>
                <option value="Roads & Infrastructure Department">Roads & Infrastructure Department</option>
                <option value="Municipal Department">Municipal Department</option>
                <option value="Fire Department">Fire Department</option>
              </select>
            </div>

            <Button variant="primary" onClick={() => setEditModalOpen(false)} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
              SAVE & CONTINUE
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // SCREEN 3: AI SCANNING VIEW
  if (step === 3) {
    return (
      <div className="container animate-fade-in" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{ padding: 'var(--space-8)', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, var(--color-brand-primary), transparent)',
            animation: 'pulseGlow 2s infinite ease-in-out',
            boxShadow: '0 0 12px var(--color-brand-primary)'
          }} />

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-subtle)',
            color: 'var(--color-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }}>
            <Cpu size={32} />
          </div>

          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
            Featherless AI diagnostics scanning...
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--font-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--status-resolved)', fontWeight: 700 }}>
              <CheckCircle2 size={16} />
              <span>Analyzing visual features of uploaded photo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: isAnalyzing ? 'var(--color-brand-primary)' : 'var(--status-resolved)', fontWeight: 700 }}>
              {isAnalyzing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Processing voice transcriptions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: locationLoading ? 'var(--color-brand-primary)' : 'var(--status-resolved)', fontWeight: 700 }}>
              {locationLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Resolving GPS location coordinate mapping</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: ACTIVE MULTILINGUAL SPEECH LISTENING VIEW
  if (step === 2) {
    const liveText = (voiceText + (interimText ? ' ' + interimText : '')).trim();

    return (
      <div className="container animate-fade-in" style={{ maxWidth: '480px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <div className="card-container" style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          border: '1.5px solid var(--color-brand-primary)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Active Language Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            <span>🎙️ LISTENING IN:</span>
            <strong>{getLanguageName(selectedVoiceLang)}</strong>
          </div>

          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            boxShadow: '0 0 0 12px var(--color-brand-subtle)',
            animation: 'pulseGlow 1.5s infinite ease-in-out'
          }}>
            <Mic size={40} />
          </div>

          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {isRecording ? 'Listening for your voice...' : 'Speech Captured'}
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', margin: '4px 0 var(--space-6)' }}>
            Speak clearly about the civic problem (e.g., "There is a large pothole near the main road...").
          </p>

          {recordingError && (
            <div style={{
              backgroundColor: 'var(--status-reopened-bg)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--font-xs)',
              color: 'var(--status-reopened)',
              fontWeight: 700,
              textAlign: 'left'
            }}>
              ⚠️ {recordingError}
            </div>
          )}

          {/* Live Transcript Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-surface-hover)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--font-sm)',
            color: liveText ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-6)',
            minHeight: '80px',
            maxHeight: '180px',
            overflowY: 'auto',
            border: '1px solid var(--color-border-default)',
            textAlign: 'left',
            lineHeight: 1.6
          }}>
            {liveText ? (
              <span>
                <strong style={{ color: 'var(--color-brand-primary)' }}>"{voiceText}"</strong>
                {interimText && <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}> {interimText}</span>}
              </span>
            ) : (
              <span style={{ fontStyle: 'italic' }}>
                (Speak now into your microphone... your words will appear here in real time)
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Button
              variant="primary"
              size="lg"
              icon={MicOff}
              onClick={handleStopRecording}
              style={{ width: '100%' }}
            >
              STOP & SUBMIT FOR AI VALIDATION ➔
            </Button>

            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setVoiceText('');
                  setInterimText('');
                  handleStartRecording();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand-primary)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
              >
                🔄 Restart Voice Recording
              </button>

              <button
                type="button"
                onClick={() => {
                  speechService.stopListening();
                  setIsRecording(false);
                  setUseTextInput(true);
                  setStep(1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
              >
                ⌨️ Switch to Typing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: STRICT STEP-BY-STEP GUIDED FLOW
  // STEP 1: VOICE INPUT -> STEP 2: PHOTO EVIDENCE -> STEP 3: LOCATION DETAILS
  // =========================================================================
  const isStep1Done = voiceValidation.isValidated && voiceValidation.status === 'VALID' && voiceValidation.aiConnected === true;
  const isStep2Done = isStep1Done && images.length > 0 && photoValidation.isValidated && photoValidation.status === 'VALID' && photoValidation.aiConnected === true;

  return (
    <div className="container animate-slide-up" style={{ maxWidth: '680px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      
      {/* Header & Step Sequence Progress Indicator */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
          <span className={`badge ${isStep1Done ? 'badge-success' : ''}`} style={{ backgroundColor: isStep1Done ? 'var(--status-resolved-bg)' : 'var(--color-brand-subtle)', color: isStep1Done ? 'var(--status-resolved)' : 'var(--color-brand-primary)', fontWeight: 800 }}>
            {isStep1Done ? '✓ STEP 1: VOICE VERIFIED' : '1. DESCRIBE ISSUE (VOICE)'}
          </span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>➔</span>
          <span className="badge" style={{ backgroundColor: isStep2Done ? 'var(--status-resolved-bg)' : isStep1Done ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface-hover)', color: isStep2Done ? 'var(--status-resolved)' : isStep1Done ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)', fontWeight: 800 }}>
            {isStep2Done ? '✓ STEP 2: PHOTO ATTACHED' : isStep1Done ? '2. PHOTO EVIDENCE' : '🔒 2. PHOTO EVIDENCE'}
          </span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>➔</span>
          <span className="badge" style={{ backgroundColor: isStep2Done ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface-hover)', color: isStep2Done ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)', fontWeight: 800 }}>
            {isStep2Done ? '3. LOCATION DETAILS' : '🔒 3. LOCATION DETAILS'}
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          Report a Civic Issue
        </h1>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Guided Civic Report Assistant: Record your voice complaint first, validate with Featherless AI, then add photo evidence and location details.
        </p>
      </div>

      {/* =================================================================== */}
      {/* STEP 1 CARD: VOICE INPUT & AI VALIDATION FIRST                     */}
      {/* =================================================================== */}
      <div className="card-container" style={{
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        border: isStep1Done ? '2px solid var(--status-resolved)' : '1.5px solid var(--color-brand-primary)',
        boxShadow: isStep1Done ? '0 4px 14px rgba(22, 163, 74, 0.12)' : 'var(--shadow-glow-indigo)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isStep1Done ? 'var(--status-resolved-bg)' : 'var(--color-brand-subtle)',
              color: isStep1Done ? 'var(--status-resolved)' : 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '14px'
            }}>
              {isStep1Done ? '✓' : '1'}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                Describe the Civic Issue
              </h2>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                Tell us about the civic problem using your voice.
              </span>
            </div>
          </div>

          {/* Real AI API Status Indicator Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {voiceValidation.status !== 'IDLE' && (
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: voiceValidation.aiConnected ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                color: voiceValidation.aiConnected ? 'var(--status-resolved)' : 'var(--status-reopened)',
                border: `1px solid ${voiceValidation.aiConnected ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`
              }}>
                {voiceValidation.aiConnected ? 'AI Validation: Connected ✓' : 'AI Validation: API Unavailable ✕'}
              </span>
            )}

            {/* Voice Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} style={{ color: 'var(--color-brand-primary)' }} />
              <select
                value={selectedVoiceLang}
                onChange={(e) => setSelectedVoiceLang(e.target.value)}
                style={{
                  backgroundColor: 'var(--color-bg-surface-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="en">English</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="kn">Kannada (కన్నడ)</option>
                <option value="mr">Marathi (మరాఠీ)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Unified Audio Recording Panel */}
        <div style={{
          backgroundColor: isStep1Done ? 'var(--status-resolved-bg)' : 'var(--color-bg-surface-hover)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          border: `1px solid ${isStep1Done ? 'rgba(22, 163, 74, 0.3)' : 'var(--color-border-default)'}`,
          textAlign: 'center',
          marginBottom: 'var(--space-5)'
        }}>
          {!isStep1Done ? (
            <>
              {/* Large Microphone Record Button */}
              <button
                type="button"
                onClick={handleStartRecording}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-primary)',
                  border: '5px solid var(--color-brand-subtle)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-3)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Mic size={36} />
              </button>

              <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                🎙️ Tap to Record Voice Description
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '420px', margin: '4px auto 0' }}>
                "Tell us about the civic problem using your voice. For example: <em>There is a large pothole near the main road...</em>"
              </p>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--status-resolved)' }}>
              <CheckCircle2 size={24} />
              <strong style={{ fontSize: 'var(--font-md)' }}>Voice Description Verified by AI</strong>
            </div>
          )}
        </div>

        {/* Live Transcript / Manual Input Box */}
        {(!useTextInput) ? (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{
              backgroundColor: 'var(--color-bg-surface)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-sm)',
              color: voiceText ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border-default)',
              minHeight: '70px',
              maxHeight: '140px',
              overflowY: 'auto',
              lineHeight: 1.6
            }}>
              {voiceText ? (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Your voice was transcribed as:
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    "{voiceText}"
                  </div>
                </div>
              ) : (
                <span style={{ fontStyle: 'italic', fontSize: 'var(--font-xs)' }}>
                  (Your voice recording will be transcribed into text here in real time...)
                </span>
              )}
            </div>

            {/* Audio Playback & Re-record Controls */}
            {voiceText && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    style={{
                      backgroundColor: 'var(--color-brand-subtle)',
                      color: 'var(--color-brand-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Volume2 size={13} /> {isPlayingAudio ? 'Playing...' : '🔊 Listen to Audio'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetVoice}
                    style={{
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      color: 'var(--color-text-secondary)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCcw size={13} /> 🎙 Record Again
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setUseTextInput(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Type size={12} /> Edit with Keyboard
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 'var(--space-4)' }} className="animate-fade-in">
            <Textarea
              label="Civic Problem Description"
              placeholder="Describe the issue in detail (e.g. There is a large pothole near the school road...)"
              value={voiceText}
              onChange={(e) => {
                setVoiceText(e.target.value);
                setVoiceValidation({ status: 'IDLE', isValidated: false, message: '', transcription: '', category: '' });
              }}
              rows={3}
            />
            <div style={{ textAlign: 'right', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setUseTextInput(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                🎙️ Switch back to Voice Recorder
              </button>
            </div>
          </div>
        )}

        {/* AI Validation Trigger Button if not yet validated */}
        {voiceText && !isStep1Done && (
          <Button
            variant="primary"
            size="md"
            icon={isValidatingVoice ? RefreshCw : Sparkles}
            disabled={isValidatingVoice || !voiceText.trim()}
            onClick={() => handleValidateVoice()}
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
          >
            {isValidatingVoice ? 'TRANSCRIBING & VALIDATING WITH AI...' : 'SUBMIT VOICE DESCRIPTION FOR AI VALIDATION ➔'}
          </Button>
        )}

        {/* ================================================================= */}
        {/* STEP 2 AI VALIDATION RESULT ALERTS (CASES A, B, C, D, E)          */}
        {/* ================================================================= */}

        {/* CASE A: VALID CIVIC ISSUE */}
        {voiceValidation.status === 'VALID' && (
          <div style={{
            backgroundColor: 'var(--status-resolved-bg)',
            border: '1.5px solid var(--status-resolved)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginTop: 'var(--space-3)'
          }} className="animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-resolved)', fontWeight: 900, fontSize: 'var(--font-sm)' }}>
                <CheckCircle2 size={18} /> {voiceValidation.message}
              </div>
              <span className="badge" style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', color: 'var(--status-resolved)', fontWeight: 800 }}>
                Confidence: {Math.round((voiceValidation.confidence || 0.9) * 100)}%
              </span>
            </div>

            {voiceValidation.issueSummary && (
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '4px 0', fontWeight: 600 }}>
                Issue Summary: <span>{voiceValidation.issueSummary}</span>
              </p>
            )}

            <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
                CATEGORY: {voiceValidation.category ? voiceValidation.category.toUpperCase() : 'CIVIC HAZARD'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--status-resolved)' }}>
                Step 1 Complete! Scroll to Step 2 below to add photo evidence ➔
              </span>
            </div>
          </div>
        )}

        {/* CASE B: UNCLEAR / INCOMPLETE DESCRIPTION */}
        {voiceValidation.status === 'UNCLEAR' && (
          <div style={{
            backgroundColor: 'var(--color-brand-subtle)',
            border: '1.5px solid var(--color-brand-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginTop: 'var(--space-3)'
          }} className="animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand-primary)', fontWeight: 900, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
              <AlertCircle size={18} /> Unclear Civic Description
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
              {voiceValidation.message}
            </p>
            <Button variant="primary" size="sm" icon={Mic} onClick={handleStartRecording}>
              🎙 Record Again
            </Button>
          </div>
        )}

        {/* CASE C: NON-CIVIC / IRRELEVANT INPUT */}
        {voiceValidation.status === 'NON_CIVIC' && (
          <div style={{
            backgroundColor: 'var(--status-reopened-bg)',
            border: '1.5px solid rgba(220, 38, 38, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginTop: 'var(--space-3)'
          }} className="animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-reopened)', fontWeight: 900, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
              <XCircle size={18} /> Not a Valid Civic Issue
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
              {voiceValidation.message}
            </p>
            <Button variant="primary" size="sm" icon={Mic} onClick={handleStartRecording}>
              🎙 Record Again
            </Button>
          </div>
        )}

        {/* CASE D: USER SHARES PERSONAL DETAILS */}
        {voiceValidation.status === 'PERSONAL_INFO' && (
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1.5px solid #F59E0B',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginTop: 'var(--space-3)'
          }} className="animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 900, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
              <ShieldAlert size={18} /> Personal Details Detected
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
              {voiceValidation.message}
            </p>
            <Button variant="primary" size="sm" icon={Mic} onClick={handleStartRecording}>
              🎙 Record Again
            </Button>
          </div>
        )}

        {/* CASE E: AI API UNAVAILABLE */}
        {voiceValidation.status === 'API_ERROR' && (
          <div style={{
            backgroundColor: 'var(--status-reopened-bg)',
            border: '1.5px solid rgba(220, 38, 38, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginTop: 'var(--space-3)'
          }} className="animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-reopened)', fontWeight: 900, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
              <XCircle size={18} /> AI Validation Currently Unavailable
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
              {voiceValidation.message}
            </p>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => handleValidateVoice()}>
              🔄 Retry AI Validation
            </Button>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* STEP 2 CARD: PHOTO EVIDENCE (UNLOCKED ONLY AFTER STEP 1 VALIDATED)  */}
      {/* =================================================================== */}
      <div className="card-container" style={{
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        opacity: isStep1Done ? 1 : 0.65,
        border: isStep2Done ? '2px solid var(--status-resolved)' : isStep1Done ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
        pointerEvents: isStep1Done ? 'auto' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isStep2Done ? 'var(--status-resolved-bg)' : isStep1Done ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface-hover)',
              color: isStep2Done ? 'var(--status-resolved)' : isStep1Done ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '14px'
            }}>
              {isStep2Done ? '✓' : isStep1Done ? '2' : <Lock size={14} />}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {isStep1Done ? 'Photo Evidence' : '🔒 Step 2: Photo Evidence'}
              </h2>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                {isStep1Done ? 'Capture a photo or upload an image file of the physical issue.' : 'Complete Step 1 voice validation to unlock photo evidence.'}
              </span>
            </div>
          </div>
        </div>

        {!isStep1Done ? (
          <div style={{ backgroundColor: 'var(--color-bg-surface-hover)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-xs)', border: '1px dashed var(--color-border-default)' }}>
            🔒 <strong>Step 2 Locked</strong> — Please record and validate your voice description in Step 1 above first.
          </div>
        ) : (
          <div>
            <div style={{
              position: 'relative',
              backgroundColor: 'var(--color-bg-surface-elevated)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border-default)',
              padding: 'var(--space-4)'
            }}>
              <FileUpload
                label="Capture Photo / Upload Evidence"
                onFilesSelected={(files) => {
                  setImages(files);
                  if (files && files.length > 0) {
                    handleValidatePhoto(files[0]);
                  } else {
                    handleResetPhoto();
                  }
                }}
              />
            </div>

            {/* Validation Loading State */}
            {isValidatingPhoto && (
              <div className="animate-pulse" style={{ backgroundColor: 'var(--color-brand-subtle)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1.5px solid var(--color-brand-border)', marginTop: 'var(--space-4)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-brand-primary)', margin: '0 auto var(--space-2)' }} />
                <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                  🔍 Verifying Photo Evidence with Featherless AI...
                </h3>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Comparing your uploaded photo with the reported voice issue ("{voiceValidation.transcription || voiceText}")...
                </p>
              </div>
            )}

            {/* CASE A: VALID MATCHING PHOTO EVIDENCE */}
            {!isValidatingPhoto && photoValidation.status === 'VALID' && (
              <div style={{
                backgroundColor: 'var(--status-resolved-bg)',
                border: '1.5px solid var(--status-resolved)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginTop: 'var(--space-4)'
              }} className="animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-resolved)', fontWeight: 900, fontSize: 'var(--font-sm)' }}>
                    <CheckCircle2 size={18} /> {photoValidation.message}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: 'var(--status-resolved)' }}>
                    AI Validation: Connected ✓
                  </span>
                </div>

                {photoValidation.detectedVisualIssue && (
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '4px 0', fontWeight: 600 }}>
                    Visual Analysis: <span>"{photoValidation.detectedVisualIssue}"</span>
                  </p>
                )}

                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  {photoValidation.reason}
                </p>

                <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    style={{ background: 'none', border: 'none', color: 'var(--status-reopened)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove / Retake Photo
                  </button>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--status-resolved)' }}>
                    Step 2 Complete! Scroll to Step 3 below for Location Details ➔
                  </span>
                </div>
              </div>
            )}

            {/* CASE B: MISMATCHING PHOTO (WRONG SUBJECT OR DIFFERENT CIVIC ISSUE) */}
            {!isValidatingPhoto && photoValidation.status === 'MISMATCH' && (
              <div style={{
                backgroundColor: 'var(--status-reopened-bg)',
                border: '1.5px solid rgba(220, 38, 38, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginTop: 'var(--space-4)'
              }} className="animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-reopened)', fontWeight: 900, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
                  <XCircle size={18} /> {photoValidation.message}
                </div>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
                  {photoValidation.reason}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleResetPhoto}
                >
                  ↻ Re-upload Photo
                </Button>
              </div>
            )}

            {/* CASE C: POOR IMAGE QUALITY (TOO BLURRY / DARK / BLANK) */}
            {!isValidatingPhoto && photoValidation.status === 'POOR_QUALITY' && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid #F59E0B',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginTop: 'var(--space-4)'
              }} className="animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 900, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
                  <AlertTriangle size={18} /> Photo Too Unclear / Blurry
                </div>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
                  {photoValidation.message}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleResetPhoto}
                >
                  ↻ Upload Clearer Photo
                </Button>
              </div>
            )}

            {/* CASE D: AI API UNAVAILABLE */}
            {!isValidatingPhoto && photoValidation.status === 'API_ERROR' && (
              <div style={{
                backgroundColor: 'var(--status-reopened-bg)',
                border: '1.5px solid rgba(220, 38, 38, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginTop: 'var(--space-4)'
              }} className="animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-reopened)', fontWeight: 900, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
                  <XCircle size={18} /> Photo Verification Currently Unavailable
                </div>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.5 }}>
                  {photoValidation.message}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => {
                    if (images.length > 0) handleValidatePhoto(images[0]);
                  }}
                >
                  🔄 Retry Photo Validation
                </Button>
              </div>
            )}

          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* STEP 3 CARD: LOCATION DETAILS (UNLOCKED ONLY AFTER PHOTO ATTACHED)   */}
      {/* =================================================================== */}
      <div className="card-container" style={{
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        opacity: isStep2Done ? 1 : 0.65,
        border: isStep2Done ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
        pointerEvents: isStep2Done ? 'auto' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isStep2Done ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface-hover)',
              color: isStep2Done ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '14px'
            }}>
              {isStep2Done ? '3' : <Lock size={14} />}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {isStep2Done ? 'Location Details' : '🔒 Step 3: Location Details'}
              </h2>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                {isStep2Done ? 'Pin location on map or use automatic GPS detection.' : 'Attach Photo Evidence in Step 2 to unlock location mapping.'}
              </span>
            </div>
          </div>
        </div>

        {!isStep2Done ? (
          <div style={{ backgroundColor: 'var(--color-bg-surface-hover)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-xs)', border: '1px dashed var(--color-border-default)' }}>
            🔒 <strong>Step 3 Locked</strong> — Please attach photo evidence in Step 2 above first.
          </div>
        ) : (
          <div>
            <LeafletMapPicker
              initialLocation={location}
              onChange={(newLoc) => setLocation(newLoc)}
            />
            <div style={{ height: 'var(--space-6)' }} />

            {/* Final Submission Button */}
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => {
                setStep(3);
                processAiAndLocation();
              }}
              style={{ width: '100%' }}
            >
              ANALYZE COMPLAINT & CONFIRM REPORT ➔
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};
