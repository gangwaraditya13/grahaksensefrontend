import { z } from 'zod';

export const loginSchema = z.object({
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .trim(),
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .trim(),
  email: z
    .string()
    .email('Please provide a valid email address')
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+-\s]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  fullAddress: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .optional()
    .or(z.literal('')),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    userName: z
      .string()
      .min(3, 'Username is required')
      .trim(),
    otp: z
      .string()
      .min(4, 'OTP code is required')
      .trim(),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  userName: z.string().min(3, 'Username must be at least 3 characters').trim(),
  email: z.string().email('Please enter a valid email address').trim(),
  phone: z.string().optional().or(z.literal('')),
  fullAddress: z.string().optional().or(z.literal('')),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const becomeSellerSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company / Brand name is required')
    .trim(),
  businessAddress: z
    .string()
    .min(5, 'Business address is required')
    .trim(),
  businessPhone: z
    .string()
    .min(10, 'Business phone must be at least 10 digits')
    .trim(),
});

export type BecomeSellerFormData = z.infer<typeof becomeSellerSchema>;
