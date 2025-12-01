import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

export interface IPasswordReset extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  },
  {
    timestamps: true,
  }
);

// Create index to automatically delete expired tokens
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate secure reset token
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const PasswordResetModel = model<IPasswordReset>('PasswordReset', passwordResetSchema);
