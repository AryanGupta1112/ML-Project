import { z } from "zod";

export const patientSchema = z.object({
  cap_shape: z.enum(["b", "c", "x", "f", "k", "s"]),
  cap_surface: z.enum(["f", "g", "y", "s"]),
  cap_color: z.enum(["n", "b", "c", "g", "r", "p", "u", "e", "w", "y"]),
  bruises: z.enum(["t", "f"]),
  odor: z.enum(["a", "l", "c", "y", "f", "m", "n", "p", "s"]),
  gill_attachment: z.enum(["a", "d", "f", "n"]),
  gill_spacing: z.enum(["c", "w", "d"]),
  gill_size: z.enum(["b", "n"]),
  gill_color: z.enum(["k", "n", "b", "h", "g", "r", "o", "p", "u", "e", "w", "y"]),
  stalk_shape: z.enum(["e", "t"]),
  stalk_root: z.enum(["b", "c", "u", "e", "z", "r", "?"]),
  stalk_surface_above_ring: z.enum(["f", "y", "k", "s"]),
  stalk_surface_below_ring: z.enum(["f", "y", "k", "s"]),
  stalk_color_above_ring: z.enum(["n", "b", "c", "g", "o", "p", "e", "w", "y"]),
  stalk_color_below_ring: z.enum(["n", "b", "c", "g", "o", "p", "e", "w", "y"]),
  veil_type: z.enum(["p", "u"]),
  veil_color: z.enum(["n", "o", "w", "y"]),
  ring_number: z.enum(["n", "o", "t"]),
  ring_type: z.enum(["c", "e", "f", "l", "n", "p", "s", "z"]),
  spore_print_color: z.enum(["k", "n", "b", "h", "r", "o", "u", "w", "y"]),
  population: z.enum(["a", "c", "n", "s", "v", "y"]),
  habitat: z.enum(["g", "l", "m", "p", "u", "w", "d"])
});

export const whatIfSchema = z.object({
  base_input: patientSchema,
  modified_input: patientSchema
});

export type PatientFormValues = z.infer<typeof patientSchema>;
export type WhatIfFormValues = z.infer<typeof whatIfSchema>;
