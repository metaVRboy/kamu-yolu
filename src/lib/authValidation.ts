import { z } from "zod";

// Sifre standardi: en az 8 karakter, en az bir harf ve bir rakam icermeli.
export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı.")
  .max(100)
  .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "Şifre en az bir harf içermeli.")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli.");

export function passwordRequirementIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("En az 8 karakter");
  if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(password)) issues.push("En az bir harf");
  if (!/[0-9]/.test(password)) issues.push("En az bir rakam");
  return issues;
}
