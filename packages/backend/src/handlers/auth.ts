import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidPassword } from '@product-catalog/shared';
import { UserModel } from '../models/User';
import { OtpModel } from '../models/Otp';
import { PasswordResetModel, generateResetToken } from '../models/PasswordReset';
import {
  withDatabase,
  parseBody,
  successResponse,
  errorResponse,
} from '../utils/handler';
import { generateToken, getUserFromEvent } from '../utils/auth';
import { generateOtp, sendOtpEmail, sendPasswordResetEmail } from '../utils/email';
import { checkRateLimit, RateLimits } from '../utils/rateLimit';

export const register = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const rateLimit = checkRateLimit(event, RateLimits.REGISTER);
      if (!rateLimit.allowed) {
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': String(rateLimit.retryAfter),
          },
          body: JSON.stringify({
            success: false,
            message: `Too many registration attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
          }),
        };
      }

      const { email, password } = parseBody<{ email: string; password: string }>(event);

      // Validate input
      if (!email || !password) {
        return errorResponse('Email and password are required');
      }

      if (!isValidEmail(email)) {
        return errorResponse('Invalid email format');
      }

      if (!isValidPassword(password)) {
        return errorResponse('Password must be at least 8 characters');
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return errorResponse('User with this email already exists', 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const otp = generateOtp();

      await OtpModel.deleteMany({ email });

      await OtpModel.create({
        email,
        otp,
        password: passwordHash,
      });

      await sendOtpEmail(email, otp);

      return successResponse({
        message: 'OTP sent to your email. Please verify to complete registration.',
        email,
      }, 200);
    } catch (error) {
      console.error('Registration error:', error);
      return errorResponse(error instanceof Error ? error.message : 'Registration failed', 500);
    }
  }
);

export const verifyOtp = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { email, otp } = parseBody<{ email: string; otp: string }>(event);

      if (!email || !otp) {
        return errorResponse('Email and OTP are required');
      }

      const otpRecord = await OtpModel.findOne({ email, otp });
      if (!otpRecord) {
        return errorResponse('Invalid or expired OTP', 400);
      }

      if (otpRecord.expiresAt < new Date()) {
        await OtpModel.deleteOne({ _id: otpRecord._id });
        return errorResponse('OTP has expired. Please request a new one.', 400);
      }

      const user = await UserModel.create({
        email: otpRecord.email,
        passwordHash: otpRecord.password,
      });

      await OtpModel.deleteOne({ _id: otpRecord._id });

      const token = generateToken(user._id.toString(), user.email);

      return successResponse({
        user: {
          id: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      }, 201);
    } catch (error) {
      console.error('OTP verification error:', error);
      return errorResponse(error instanceof Error ? error.message : 'Verification failed', 500);
    }
  }
);

export const resendOtp = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const rateLimit = checkRateLimit(event, RateLimits.RESEND_OTP);
      if (!rateLimit.allowed) {
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': String(rateLimit.retryAfter),
          },
          body: JSON.stringify({
            success: false,
            message: `Too many resend attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
          }),
        };
      }

      const { email } = parseBody<{ email: string }>(event);

      // Validate input
      if (!email) {
        return errorResponse('Email is required');
      }

      const otpRecord = await OtpModel.findOne({ email });
      if (!otpRecord) {
        return errorResponse('No pending registration found for this email', 404);
      }

      const otp = generateOtp();

      otpRecord.otp = otp;
      otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await otpRecord.save();

      await sendOtpEmail(email, otp);

      return successResponse({
        message: 'OTP resent to your email',
      }, 200);
    } catch (error) {
      console.error('Resend OTP error:', error);
      return errorResponse(error instanceof Error ? error.message : 'Failed to resend OTP', 500);
    }
  }
);

export const login = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { email, password } = parseBody<{ email: string; password: string }>(event);

      if (!email || !password) {
        return errorResponse('Email and password are required');
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return errorResponse('Invalid credentials', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return errorResponse('Invalid credentials', 401);
      }

      const token = generateToken(user._id.toString(), user.email);

      return successResponse({
        user: {
          id: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Login failed', 500);
    }
  }
);

export const me = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { userId } = getUserFromEvent(event);

      const user = await UserModel.findById(userId);
      if (!user) {
        return errorResponse('User not found', 404);
      }

      return successResponse({
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Authentication failed', 401);
    }
  }
);

export const forgotPassword = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const rateLimit = checkRateLimit(event, RateLimits.FORGOT_PASSWORD);
      if (!rateLimit.allowed) {
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': String(rateLimit.retryAfter),
          },
          body: JSON.stringify({
            success: false,
            message: `Too many password reset attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
          }),
        };
      }

      const { email } = parseBody<{ email: string }>(event);

      // Validate input
      if (!email) {
        return errorResponse('Email is required');
      }

      if (!isValidEmail(email)) {
        return errorResponse('Invalid email format');
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return successResponse({
          message: 'If an account exists with this email, you will receive password reset instructions.',
        }, 200);
      }

      const resetToken = generateResetToken();

      await PasswordResetModel.deleteMany({ email });

      await PasswordResetModel.create({
        email,
        token: resetToken,
      });

      await sendPasswordResetEmail(email, resetToken);

      return successResponse({
        message: 'If an account exists with this email, you will receive password reset instructions.',
      }, 200);
    } catch (error) {
      console.error('Forgot password error:', error);
      return errorResponse(error instanceof Error ? error.message : 'Failed to process password reset request', 500);
    }
  }
);

export const verifyResetToken = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { token } = parseBody<{ token: string }>(event);

      if (!token) {
        return errorResponse('Reset token is required');
      }

      const resetRecord = await PasswordResetModel.findOne({ token });
      if (!resetRecord) {
        return errorResponse('Invalid or expired reset token', 400);
      }

      if (resetRecord.expiresAt < new Date()) {
        await PasswordResetModel.deleteOne({ _id: resetRecord._id });
        return errorResponse('Reset token has expired. Please request a new one.', 400);
      }

      return successResponse({
        message: 'Token is valid',
        email: resetRecord.email,
      }, 200);
    } catch (error) {
      console.error('Verify reset token error:', error);
      return errorResponse(error instanceof Error ? error.message : 'Failed to verify token', 500);
    }
  }
);

export const resetPassword = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const rateLimit = checkRateLimit(event, RateLimits.RESET_PASSWORD);
      if (!rateLimit.allowed) {
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': String(rateLimit.retryAfter),
          },
          body: JSON.stringify({
            success: false,
            message: `Too many password reset attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
          }),
        };
      }

      const { token, password } = parseBody<{ token: string; password: string }>(event);

      if (!token || !password) {
        return errorResponse('Reset token and new password are required');
      }

      if (!isValidPassword(password)) {
        return errorResponse('Password must be at least 8 characters');
      }

      const resetRecord = await PasswordResetModel.findOne({ token });
      if (!resetRecord) {
        return errorResponse('Invalid or expired reset token', 400);
      }

      if (resetRecord.expiresAt < new Date()) {
        await PasswordResetModel.deleteOne({ _id: resetRecord._id });
        return errorResponse('Reset token has expired. Please request a new one.', 400);
      }

      const user = await UserModel.findOne({ email: resetRecord.email });
      if (!user) {
        return errorResponse('User not found', 404);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      user.passwordHash = passwordHash;
      await user.save();

      await PasswordResetModel.deleteOne({ _id: resetRecord._id });

      const authToken = generateToken(user._id.toString(), user.email);

      return successResponse({
        message: 'Password has been reset successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token: authToken,
      }, 200);
    } catch (error) {
      console.error('Reset password error:', error);
      return errorResponse(error instanceof Error ? error.message : 'Failed to reset password', 500);
    }
  }
);
