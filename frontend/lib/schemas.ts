import { z } from "zod";

function numberField(label: string, min: number, max: number) {
  return z
    .number({ invalid_type_error: `${label} must be a number.` })
    .min(min, `${label} must be at least ${min}.`)
    .max(max, `${label} must be at most ${max}.`);
}

function wholeNumberField(label: string, min: number, max: number) {
  return z
    .number({ invalid_type_error: `Please choose ${label.toLowerCase()}.` })
    .int(`Please choose ${label.toLowerCase()}.`)
    .min(min, `Please choose a valid ${label.toLowerCase()}.`)
    .max(max, `Please choose a valid ${label.toLowerCase()}.`);
}

export const patientSchema = z.object({
  age: wholeNumberField("Age", 18, 100),
  sex: wholeNumberField("Sex", 0, 1),
  cp: wholeNumberField("Chest pain group", 0, 3),
  trestbps: numberField("Resting blood pressure", 80, 250),
  chol: numberField("Cholesterol", 80, 700),
  fbs: wholeNumberField("Fasting blood sugar option", 0, 1),
  restecg: wholeNumberField("ECG result at rest", 0, 2),
  thalach: numberField("Max heart rate", 60, 250),
  exang: wholeNumberField("Chest pain during exercise option", 0, 1),
  oldpeak: numberField("ECG stress change", 0, 10),
  slope: wholeNumberField("ECG slope option", 0, 2),
  ca: wholeNumberField("Major blood vessels option", 0, 4),
  thal: wholeNumberField("Thalassemia result", 0, 3)
});

export const whatIfSchema = z.object({
  base_input: patientSchema,
  modified_input: patientSchema
});

export type PatientFormValues = z.infer<typeof patientSchema>;
export type WhatIfFormValues = z.infer<typeof whatIfSchema>;
