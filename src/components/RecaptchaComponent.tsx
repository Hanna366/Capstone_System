import React, { useRef, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaComponentProps {
  onVerify: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  sitekey?: string;
}

export const RecaptchaComponent: React.FC<RecaptchaComponentProps> = ({
  onVerify,
  onExpired,
  onError,
  sitekey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LesdGQsAAAAAFFf2Rl3Mu0E8h26Tn641PCgyyEb' // Your reCAPTCHA v2 site key
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    onVerify(token);
  }, [onVerify]);

  const handleRecaptchaExpired = useCallback(() => {
    if (onExpired) {
      onExpired();
    }
    onVerify(null);
  }, [onExpired, onVerify]);

  const handleRecaptchaError = useCallback(() => {
    if (onError) {
      onError();
    }
    onVerify(null);
  }, [onError, onVerify]);

  const resetRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    onVerify(null);
  }, [onVerify]);

  // Expose reset method via ref
  React.useImperativeHandle(recaptchaRef, () => ({
    reset: resetRecaptcha
  }));

  return (
    <div className="flex flex-col items-center space-y-2">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={sitekey}
        onChange={handleRecaptchaChange}
        onExpired={handleRecaptchaExpired}
        onError={handleRecaptchaError}
        theme="light"
        size="normal"
      />
      <button
        type="button"
        onClick={resetRecaptcha}
        className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
      >
        Reset reCAPTCHA
      </button>
    </div>
  );
};

export default RecaptchaComponent;
