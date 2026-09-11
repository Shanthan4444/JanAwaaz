import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, X, RefreshCw, CheckCircle, Video } from 'lucide-react';
import { Button } from './Button';

export const FileUpload = ({ onFilesSelected, label = 'Photo Evidence (Camera / Upload)' }) => {
  const [previews, setPreviews] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start Live HTML5 Camera Stream
  const startCameraStream = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    const constraintsQueue = [
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      {
        video: {
          facingMode: 'environment'
        }
      },
      {
        video: true
      }
    ];

    let stream = null;
    let lastError = null;

    for (const constraints of constraintsQueue) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
        console.warn('[CAMERA TRY FAIL]', constraints, err);
      }
    }

    if (stream) {
      streamRef.current = stream;
      
      // Attach stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      }, 100);
    } else {
      console.error('[CAMERA ACCESS FAILED]', lastError);
      
      if (lastError && (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError')) {
        setCameraError('Camera permission is required to capture issue evidence. Please allow camera access in browser settings.');
      } else if (lastError && (lastError.name === 'NotFoundError' || lastError.name === 'DevicesNotFoundError')) {
        setCameraError('No camera hardware detected. Please choose a photo from your gallery.');
      } else if (lastError && (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError')) {
        setCameraError('Camera is currently block-accessed or busy. Please close other apps and try again.');
      } else {
        setCameraError('Direct camera stream failed. Please upload a photo from your gallery.');
      }
      setIsCameraActive(false);
    }
  };

  // Capture Snapshot from Live Video Stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.85);

    const updated = [...previews, base64Image];
    setPreviews(updated);
    if (onFilesSelected) onFilesSelected(updated);

    stopCameraStream();
  };

  // Process Native File Input / Mobile Camera Upload with automatic client-side canvas compression
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const compressedImages = await Promise.all(
      files.map((file) => compressImageFile(file))
    );

    const updated = [...previews, ...compressedImages];
    setPreviews(updated);
    if (onFilesSelected) onFilesSelected(updated);
  };

  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(event.target.result);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    const updated = previews.filter((_, i) => i !== idx);
    setPreviews(updated);
    if (onFilesSelected) onFilesSelected(updated);
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      {/* Live Camera Viewfinder Modal / Overlay */}
      {isCameraActive ? (
        <div style={{ backgroundColor: '#000000', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', textAlign: 'center', marginBottom: 'var(--space-4)', border: '2px solid var(--color-brand-primary)' }}>
          <div style={{ position: 'relative', width: '100%', height: '260px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#111827' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" size="sm" onClick={stopCameraStream}>
              CANCEL
            </Button>
            <Button variant="primary" size="md" icon={Camera} onClick={captureSnapshot}>
              📸 CAPTURE PHOTO SNAPSHOT
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Dual Action Bar: Open Live Web Camera & Open File Directory / Mobile Camera */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="primary"
              icon={Camera}
              onClick={startCameraStream}
              style={{ flex: 1, minWidth: '180px' }}
            >
              📸 OPEN LIVE CAMERA
            </Button>

            <Button
              type="button"
              variant="secondary"
              icon={UploadCloud}
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, minWidth: '180px' }}
            >
              📁 CHOOSE PHOTO FROM GALLERY / FILE
            </Button>

            {/* Hidden Input with capture="environment" for Native Mobile Camera / Directory Picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Drag & Drop Fallback Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-brand-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-surface-elevated)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <UploadCloud size={32} style={{ color: 'var(--color-brand-primary)', marginBottom: 'var(--space-2)' }} />
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Click to open native camera or select photo files
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
              Mobile: Launches Native Camera • Web: Opens Live Camera Stream & File Selector
            </p>
          </div>

          {cameraError && (
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-status-danger)', padding: 'var(--space-2)' }}>
              ⚠️ {cameraError}
            </div>
          )}
        </div>
      )}

      {/* Captured / Uploaded Image Previews */}
      {previews.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase' }}>
            ATTACHED PHOTO EVIDENCE ({previews.length}):
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
            {previews.map((src, idx) => (
              <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-brand-primary)', boxShadow: 'var(--shadow-glow-indigo)' }}>
                <img src={src} alt="Evidence preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'rgba(225, 29, 72, 0.9)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
