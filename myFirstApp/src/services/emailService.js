// EmailJS Service - Gửi OTP qua email thật
// Sử dụng EmailJS REST API (không cần backend)

const EMAILJS_SERVICE_ID = 'service_ga3lchw';
const EMAILJS_TEMPLATE_ID = 'template_owlbkcu';
const EMAILJS_PUBLIC_KEY = 'raCKJTXUC2SGblv_A';
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * Gửi OTP qua email bằng EmailJS
 * @param {string} toEmail - Email người nhận
 * @param {string} otpCode - Mã OTP 6 số
 * @param {string} toName - Tên người nhận (optional)
 */
export const sendOTPEmail = async (toEmail, otpCode, toName = 'Bạn') => {
  try {
    const response = await fetch(EMAILJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: toEmail,
          to_name: toName,
          otp_code: otpCode,
        },
      }),
    });

    if (response.status === 200 || response.ok) {
      console.log(`[EmailJS] OTP sent to ${toEmail}`);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`[EmailJS] Failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('[EmailJS] Error:', error.message);
    return { success: false, error: error.message };
  }
};
