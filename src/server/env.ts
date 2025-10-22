import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("production"),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  DEFAULT_COMMISSION_RATE: z.string().default("0.70"), // 70% to sellers
  REFERRAL_REWARD_AMOUNT: z.string().default("10"), // $10 per referral
});

// Parse environment variables with defaults for build time
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV || "production",
  BASE_URL: process.env.BASE_URL,
  BASE_URL_OTHER_PORT: process.env.BASE_URL_OTHER_PORT,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  DEFAULT_COMMISSION_RATE: process.env.DEFAULT_COMMISSION_RATE || "0.70",
  REFERRAL_REWARD_AMOUNT: process.env.REFERRAL_REWARD_AMOUNT || "10",
});

// Runtime validation for required fields
export function validateRequiredEnv() {
  const requiredFields = ['ADMIN_PASSWORD', 'JWT_SECRET', 'OPENROUTER_API_KEY'];
  const missing = requiredFields.filter(field => !process.env[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
