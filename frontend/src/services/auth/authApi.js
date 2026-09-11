// Shared Auth API Client interface
export const authApi = {
  requestMobileOTP: async (mobileNumber) => {
    // Phase 0 Architectural Contract
    return { success: true, message: 'OTP dispatched via gateway' };
  },
  verifyMobileOTP: async (mobileNumber, otp) => {
    return {
      success: true,
      token: 'mock-jwt-token',
      user: {
        userId: 'USR-001',
        name: 'Citizen Submitter',
        role: 'CITIZEN',
        permissions: ['report:issue', 'track:issue', 'verify:resolution']
      }
    };
  },
  authenticateAuthority: async (credentials) => {
    return {
      success: true,
      token: 'mock-jwt-token-auth',
      user: {
        userId: 'AUTH-101',
        name: 'Municipal Authority Officer',
        role: 'AUTHORITY',
        permissions: ['issues:manage', 'workers:assign']
      }
    };
  }
};
