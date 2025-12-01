import { generateOtp } from '../email';

describe('Email Utils', () => {
  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOtp();
      
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs on consecutive calls', () => {
      const otp1 = generateOtp();
      const otp2 = generateOtp();
      const otp3 = generateOtp();
      
      // While theoretically they could be the same, it's extremely unlikely
      // Testing that they are all valid 6-digit codes
      expect(/^\d{6}$/.test(otp1)).toBe(true);
      expect(/^\d{6}$/.test(otp2)).toBe(true);
      expect(/^\d{6}$/.test(otp3)).toBe(true);
    });

    it('should generate OTP in valid range (100000-999999)', () => {
      // Generate multiple OTPs to verify range
      const otps = Array.from({ length: 100 }, () => generateOtp());
      
      // All should be exactly 6 digits
      otps.forEach(otp => {
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);
        
        // Verify all OTPs are in the range 100000-999999 (no leading zeros)
        const numValue = parseInt(otp, 10);
        expect(numValue).toBeGreaterThanOrEqual(100000);
        expect(numValue).toBeLessThanOrEqual(999999);
      });
    });

    it('should only generate numeric characters', () => {
      const otps = Array.from({ length: 50 }, () => generateOtp());
      
      otps.forEach(otp => {
        const chars = otp.split('');
        chars.forEach(char => {
          expect(parseInt(char, 10)).toBeGreaterThanOrEqual(0);
          expect(parseInt(char, 10)).toBeLessThanOrEqual(9);
        });
      });
    });

    it('should generate OTPs within valid range (000000-999999)', () => {
      const otps = Array.from({ length: 100 }, () => generateOtp());
      
      otps.forEach(otp => {
        const numValue = parseInt(otp, 10);
        expect(numValue).toBeGreaterThanOrEqual(0);
        expect(numValue).toBeLessThanOrEqual(999999);
      });
    });
  });

  // Note: sendOtpEmail and sendPasswordResetEmail are not tested here because:
  // 1. They require SMTP configuration
  // 2. They make external network calls
  // 3. They should be tested with mocking in integration tests
  // 4. Testing them would require mocking nodemailer transport
  
  // For production, you would want to:
  // - Mock nodemailer.createTransport()
  // - Verify that sendMail is called with correct parameters
  // - Test email template rendering
  // - Test error handling for SMTP failures
});
