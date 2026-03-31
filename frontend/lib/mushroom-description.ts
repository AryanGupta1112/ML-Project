import type { PatientFormValues } from "@/lib/schemas";
import { getFeatureValueLabel } from "@/lib/patient-config";

function text(name: keyof PatientFormValues, value: string) {
  return getFeatureValueLabel(name, value).toLowerCase();
}

export function buildMushroomDescription(values: PatientFormValues) {
  const capSentence = `The mushroom has a ${text("cap_shape", values.cap_shape)} top, a ${text("cap_surface", values.cap_surface)} surface, and a ${text("cap_color", values.cap_color)} color.`;
  const bruising = values.bruises === "t" ? "Bruising marks are visible." : "No bruising marks are visible.";
  const odorSentence = `${bruising} The odor is ${text("odor", values.odor)}.`;
  const gillSentence = `Under the top, gills are ${text("gill_attachment", values.gill_attachment)}, ${text("gill_spacing", values.gill_spacing)}, ${text("gill_size", values.gill_size)}, and ${text("gill_color", values.gill_color)} in color.`;
  const stemSentence = `The stem is ${text("stalk_shape", values.stalk_shape)} with a ${text("stalk_root", values.stalk_root)} base, ${text("stalk_surface_above_ring", values.stalk_surface_above_ring)} above the ring and ${text("stalk_surface_below_ring", values.stalk_surface_below_ring)} below; colors are ${text("stalk_color_above_ring", values.stalk_color_above_ring)} above and ${text("stalk_color_below_ring", values.stalk_color_below_ring)} below.`;
  const ringCount = text("ring_number", values.ring_number);
  const ringSentence = `It has a ${text("veil_type", values.veil_type)} veil with ${text("veil_color", values.veil_color)} color, ${ringCount} visible ${ringCount === "one" ? "ring" : "rings"}, and a ${text("ring_type", values.ring_type)} ring type.`;
  const environmentSentence = `The spore print is ${text("spore_print_color", values.spore_print_color)}, nearby growth is ${text("population", values.population)}, and it was found in a ${text("habitat", values.habitat)} habitat.`;

  return `${capSentence} ${odorSentence} ${gillSentence} ${stemSentence} ${ringSentence} ${environmentSentence}`;
}
