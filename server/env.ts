import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  OPENROUTER_API_KEY: z.string(),
  
  // Shuffle feature APIs
  HUBSPOT_API_KEY: z.string().optional(),
  SERPER_API_KEY: z.string().optional(),
  
  // Email configuration
  EMAIL_HOST: z.string().default("smtp.gmail.com"),
  EMAIL_PORT: z.string().default("587"),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default("noreply@lucy-accessibility.com"),
  EMAIL_ENABLED: z.string().default("false").transform(val => val === "true"),
});

export const env = envSchema.parse(process.env);
