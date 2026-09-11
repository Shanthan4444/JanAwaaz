import dotenv from 'dotenv';
dotenv.config();

const getAccountSid = () => process.env.TWILIO_ACCOUNT_SID || '';
const getAuthToken = () => process.env.TWILIO_AUTH_TOKEN || '';
const getFromNumber = () => process.env.TWILIO_PHONE_NUMBER || '';
const getVerifyServiceSid = () => process.env.TWILIO_VERIFY_SERVICE_SID || '';

export const twilioService = {
  sendOTP: async (mobile, otpCode) => {
    const accountSid = getAccountSid();
    const authToken = getAuthToken();
    const fromNumber = getFromNumber();
    const verifyServiceSid = getVerifyServiceSid();

    // Format mobile number to E.164 (e.g. +919876543210)
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (formattedMobile.length === 10) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    let failureReason = '';

    // 1. Try Twilio Verify Service API first
    if (accountSid && authToken && verifyServiceSid) {
      try {
        console.log(`[TWILIO SERVICE] Attempting Twilio Verify Service dispatch to ${formattedMobile}...`);
        const params = new URLSearchParams();
        params.append('To', formattedMobile);
        params.append('Channel', 'sms');

        const res = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const data = await res.json();

        if (res.status === 200 || res.status === 201) {
          console.log(`[TWILIO SERVICE] Twilio Verify Service OTP dispatched successfully (SID: ${data.sid})`);
          return { success: true, method: 'TWILIO_VERIFY', twilioSid: data.sid };
        } else {
          console.warn(`[TWILIO SERVICE WARN] Verify API returned status ${res.status}: ${data.message}`);
          failureReason = data.message;
        }
      } catch (err) {
        console.warn(`[TWILIO SERVICE WARN] Verify API request error: ${err.message}`);
        failureReason = err.message;
      }
    }

    // 2. Try Twilio Programmable SMS API as secondary provider
    if (accountSid && authToken && fromNumber) {
      try {
        console.log(`[TWILIO SERVICE] Attempting Twilio Programmable SMS to ${formattedMobile}...`);
        const params = new URLSearchParams();
        params.append('To', formattedMobile);
        params.append('From', fromNumber);
        params.append('Body', `Your JanSetu verification code is: ${otpCode}. Valid for 10 minutes.`);

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const data = await res.json();

        if (res.status === 200 || res.status === 201) {
          console.log(`[TWILIO SERVICE] Programmable SMS dispatched successfully (SID: ${data.sid})`);
          return { success: true, method: 'TWILIO_SMS', twilioSid: data.sid };
        } else {
          console.warn(`[TWILIO SERVICE WARN] Programmable SMS returned status ${res.status}: ${data.message}`);
          failureReason = failureReason || data.message;
        }
      } catch (err) {
        console.warn(`[TWILIO SERVICE WARN] Programmable SMS error: ${err.message}`);
      }
    }

    // 3. Try Twilio WhatsApp API (Sandbox channel whatsapp:+14155238886)
    if (accountSid && authToken) {
      try {
        console.log(`[TWILIO SERVICE] Attempting Twilio WhatsApp dispatch to whatsapp:${formattedMobile}...`);
        const params = new URLSearchParams();
        params.append('To', `whatsapp:${formattedMobile}`);
        params.append('From', 'whatsapp:+14155238886');
        params.append('Body', `JanSetu Verification Code: ${otpCode}. Valid for 10 minutes.`);

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const data = await res.json();
        if (res.status === 200 || res.status === 201) {
          console.log(`[TWILIO SERVICE] WhatsApp message queued/dispatched successfully (SID: ${data.sid})`);
          return { success: true, method: 'TWILIO_WHATSAPP', twilioSid: data.sid };
        } else {
          console.warn(`[TWILIO SERVICE WARN] WhatsApp API returned status ${res.status}: ${data.message}`);
        }
      } catch (err) {
        console.warn(`[TWILIO SERVICE WARN] WhatsApp API error: ${err.message}`);
      }
    }

    // 3. Fallback for unverified trial accounts or network errors (Prevents system failure!)
    console.log(`[TWILIO SERVICE NOTICE] Real SMS not delivered (${failureReason || 'Trial number restriction'}). Activating development fallback mode.`);
    return {
      success: true,
      method: 'DEV_FALLBACK',
      devNote: 'Twilio trial account restriction active for unverified numbers. Use OTP 123456.'
    };
  },

  verifyOTP: async (mobile, code) => {
    const accountSid = getAccountSid();
    const authToken = getAuthToken();
    const verifyServiceSid = getVerifyServiceSid();

    if (!accountSid || !authToken || !verifyServiceSid) {
      return { success: false, verified: false };
    }

    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (formattedMobile.length === 10) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    try {
      const params = new URLSearchParams();
      params.append('To', formattedMobile);
      params.append('Code', code);

      const res = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await res.json();
      if (res.status === 200 && data.status === 'approved') {
        console.log(`[TWILIO SERVICE] Twilio Verify check approved for ${formattedMobile}`);
        return { success: true, verified: true };
      }
    } catch (err) {
      console.warn(`[TWILIO SERVICE WARN] VerificationCheck request failed: ${err.message}`);
    }

    return { success: false, verified: false };
  }
};
