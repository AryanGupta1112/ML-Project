import type { PatientFormValues } from "@/lib/schemas";

export const defaultPatientValues: PatientFormValues = {
  age: 54,
  sex: 1,
  cp: 0,
  trestbps: 140,
  chol: 239,
  fbs: 0,
  restecg: 1,
  thalach: 160,
  exang: 0,
  oldpeak: 1.2,
  slope: 1,
  ca: 0,
  thal: 2
};

export const fieldGroups = [
  {
    title: "Demographics",
    fields: ["age", "sex"] as const
  },
  {
    title: "Symptoms and ECG Test",
    fields: ["cp", "restecg", "exang", "oldpeak", "slope", "thal"] as const
  },
  {
    title: "Blood Pressure and Lab Values",
    fields: ["trestbps", "chol", "fbs", "thalach", "ca"] as const
  }
];

export const fieldMeta = {
  age: { label: "Age", type: "number", step: 1 },
  sex: { label: "Sex", type: "select", options: [{ value: 0, label: "Female" }, { value: 1, label: "Male" }] },
  cp: {
    label: "Chest Pain Group",
    type: "select",
    options: [
      { value: 0, label: "Typical chest pain" },
      { value: 1, label: "Atypical chest pain" },
      { value: 2, label: "Chest pain not linked to angina" },
      { value: 3, label: "No chest pain symptoms" }
    ]
  },
  trestbps: { label: "Resting Blood Pressure (mm Hg)", type: "number", step: 1 },
  chol: { label: "Cholesterol (mg/dL)", type: "number", step: 1 },
  fbs: {
    label: "Fasting Blood Sugar",
    type: "select",
    options: [
      { value: 0, label: "120 mg/dL or lower" },
      { value: 1, label: "Above 120 mg/dL" }
    ]
  },
  restecg: {
    label: "ECG Result At Rest",
    type: "select",
    options: [
      { value: 0, label: "Normal" },
      { value: 1, label: "Minor ECG change" },
      { value: 2, label: "Left ventricle thickening pattern" }
    ]
  },
  thalach: { label: "Max Heart Rate", type: "number", step: 1 },
  exang: {
    label: "Chest Pain During Exercise",
    type: "select",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" }
    ]
  },
  oldpeak: { label: "ECG Stress Change (Oldpeak)", type: "number", step: 0.1 },
  slope: {
    label: "ECG Slope (ST Segment)",
    type: "select",
    options: [
      { value: 0, label: "Upward slope" },
      { value: 1, label: "Flat" },
      { value: 2, label: "Downward slope" }
    ]
  },
  ca: {
    label: "Major Blood Vessels Seen (0-4)",
    type: "select",
    options: [
      { value: 0, label: "0" },
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" }
    ]
  },
  thal: {
    label: "Thalassemia Result",
    type: "select",
    options: [
      { value: 0, label: "Unknown" },
      { value: 1, label: "Fixed defect" },
      { value: 2, label: "Normal" },
      { value: 3, label: "Reversible defect" }
    ]
  }
} as const;

export function getFeatureLabel(name: string) {
  const map = fieldMeta as Record<string, { label: string }>;
  return map[name]?.label ?? name;
}
