import type { PatientFormValues } from "@/lib/schemas";

export const defaultPatientValues: PatientFormValues = {
  cap_shape: "x",
  cap_surface: "s",
  cap_color: "n",
  bruises: "t",
  odor: "n",
  gill_attachment: "f",
  gill_spacing: "c",
  gill_size: "b",
  gill_color: "n",
  stalk_shape: "t",
  stalk_root: "e",
  stalk_surface_above_ring: "s",
  stalk_surface_below_ring: "s",
  stalk_color_above_ring: "w",
  stalk_color_below_ring: "w",
  veil_type: "p",
  veil_color: "w",
  ring_number: "o",
  ring_type: "p",
  spore_print_color: "n",
  population: "v",
  habitat: "d"
};

export const highRiskMushroomValues: PatientFormValues = {
  ...defaultPatientValues,
  odor: "f",
  gill_size: "n",
  spore_print_color: "r",
  ring_type: "e",
  habitat: "w"
};

export const fieldGroups = [
  {
    title: "Top Part (Cap)",
    fields: ["cap_shape", "cap_surface", "cap_color", "bruises", "odor"] as const
  },
  {
    title: "Gills and Stem",
    fields: [
      "gill_attachment",
      "gill_spacing",
      "gill_size",
      "gill_color",
      "stalk_shape",
      "stalk_root",
      "stalk_surface_above_ring",
      "stalk_surface_below_ring",
      "stalk_color_above_ring",
      "stalk_color_below_ring"
    ] as const
  },
  {
    title: "Ring and Place Found",
    fields: ["veil_type", "veil_color", "ring_number", "ring_type", "spore_print_color", "population", "habitat"] as const
  }
];

export const fieldMeta = {
  cap_shape: {
    label: "Top Shape",
    hint: "Shape of the mushroom top.",
    type: "select",
    options: [
      { value: "b", label: "Bell" },
      { value: "c", label: "Conical" },
      { value: "x", label: "Convex" },
      { value: "f", label: "Flat" },
      { value: "k", label: "Knobbed" },
      { value: "s", label: "Sunken" }
    ]
  },
  cap_surface: {
    label: "Top Texture",
    hint: "How the top feels or looks on the surface.",
    type: "select",
    options: [
      { value: "f", label: "Fibrous" },
      { value: "g", label: "Grooves" },
      { value: "y", label: "Scaly" },
      { value: "s", label: "Smooth" }
    ]
  },
  cap_color: {
    label: "Top Color",
    hint: "Main color of the mushroom top.",
    type: "select",
    options: [
      { value: "n", label: "Brown" },
      { value: "b", label: "Buff" },
      { value: "c", label: "Cinnamon" },
      { value: "g", label: "Gray" },
      { value: "r", label: "Green" },
      { value: "p", label: "Pink" },
      { value: "u", label: "Purple" },
      { value: "e", label: "Red" },
      { value: "w", label: "White" },
      { value: "y", label: "Yellow" }
    ]
  },
  bruises: {
    label: "Bruises",
    hint: "Does it show bruised marks when touched?",
    type: "select",
    options: [
      { value: "t", label: "Bruises visible" },
      { value: "f", label: "No bruises" }
    ]
  },
  odor: {
    label: "Odor",
    hint: "Smell of the mushroom (if known).",
    type: "select",
    options: [
      { value: "n", label: "None" },
      { value: "a", label: "Almond" },
      { value: "l", label: "Anise" },
      { value: "c", label: "Creosote" },
      { value: "y", label: "Fishy" },
      { value: "f", label: "Foul" },
      { value: "m", label: "Musty" },
      { value: "p", label: "Pungent" },
      { value: "s", label: "Spicy" }
    ]
  },
  gill_attachment: {
    label: "How Gills Join Stem",
    hint: "How the thin lines under the cap connect to the stem.",
    type: "select",
    options: [
      { value: "a", label: "Attached" },
      { value: "d", label: "Descending" },
      { value: "f", label: "Free" },
      { value: "n", label: "Notched" }
    ]
  },
  gill_spacing: {
    label: "Gill Spacing",
    hint: "Whether gills are close together or far apart.",
    type: "select",
    options: [
      { value: "c", label: "Close" },
      { value: "w", label: "Crowded" },
      { value: "d", label: "Distant" }
    ]
  },
  gill_size: {
    label: "Gill Width",
    hint: "Whether gills look broad or narrow.",
    type: "select",
    options: [
      { value: "b", label: "Broad" },
      { value: "n", label: "Narrow" }
    ]
  },
  gill_color: {
    label: "Gill Color",
    hint: "Color of the gills under the cap.",
    type: "select",
    options: [
      { value: "k", label: "Black" },
      { value: "n", label: "Brown" },
      { value: "b", label: "Buff" },
      { value: "h", label: "Chocolate" },
      { value: "g", label: "Gray" },
      { value: "r", label: "Green" },
      { value: "o", label: "Orange" },
      { value: "p", label: "Pink" },
      { value: "u", label: "Purple" },
      { value: "e", label: "Red" },
      { value: "w", label: "White" },
      { value: "y", label: "Yellow" }
    ]
  },
  stalk_shape: {
    label: "Stem Shape",
    hint: "Overall shape of the stem.",
    type: "select",
    options: [
      { value: "e", label: "Enlarging" },
      { value: "t", label: "Tapering" }
    ]
  },
  stalk_root: {
    label: "Stem Base",
    hint: "How the bottom/root area of the stem looks.",
    type: "select",
    options: [
      { value: "b", label: "Bulbous" },
      { value: "c", label: "Club" },
      { value: "u", label: "Cup" },
      { value: "e", label: "Equal" },
      { value: "z", label: "Root-like strands" },
      { value: "r", label: "Rooted" },
      { value: "?", label: "Missing/Unknown" }
    ]
  },
  stalk_surface_above_ring: {
    label: "Stem Texture (Above Ring)",
    hint: "Texture of the stem above the ring.",
    type: "select",
    options: [
      { value: "f", label: "Fibrous" },
      { value: "y", label: "Scaly" },
      { value: "k", label: "Silky" },
      { value: "s", label: "Smooth" }
    ]
  },
  stalk_surface_below_ring: {
    label: "Stem Texture (Below Ring)",
    hint: "Texture of the stem below the ring.",
    type: "select",
    options: [
      { value: "f", label: "Fibrous" },
      { value: "y", label: "Scaly" },
      { value: "k", label: "Silky" },
      { value: "s", label: "Smooth" }
    ]
  },
  stalk_color_above_ring: {
    label: "Stem Color (Above Ring)",
    hint: "Color of the stem above the ring.",
    type: "select",
    options: [
      { value: "n", label: "Brown" },
      { value: "b", label: "Buff" },
      { value: "c", label: "Cinnamon" },
      { value: "g", label: "Gray" },
      { value: "o", label: "Orange" },
      { value: "p", label: "Pink" },
      { value: "e", label: "Red" },
      { value: "w", label: "White" },
      { value: "y", label: "Yellow" }
    ]
  },
  stalk_color_below_ring: {
    label: "Stem Color (Below Ring)",
    hint: "Color of the stem below the ring.",
    type: "select",
    options: [
      { value: "n", label: "Brown" },
      { value: "b", label: "Buff" },
      { value: "c", label: "Cinnamon" },
      { value: "g", label: "Gray" },
      { value: "o", label: "Orange" },
      { value: "p", label: "Pink" },
      { value: "e", label: "Red" },
      { value: "w", label: "White" },
      { value: "y", label: "Yellow" }
    ]
  },
  veil_type: {
    label: "Veil Type",
    hint: "Type of thin covering around parts of the mushroom.",
    type: "select",
    options: [
      { value: "p", label: "Partial" },
      { value: "u", label: "Universal" }
    ]
  },
  veil_color: {
    label: "Veil Color",
    hint: "Color of that thin covering.",
    type: "select",
    options: [
      { value: "n", label: "Brown" },
      { value: "o", label: "Orange" },
      { value: "w", label: "White" },
      { value: "y", label: "Yellow" }
    ]
  },
  ring_number: {
    label: "Number of Rings",
    hint: "How many rings are visible on the stem.",
    type: "select",
    options: [
      { value: "n", label: "None" },
      { value: "o", label: "One" },
      { value: "t", label: "Two" }
    ]
  },
  ring_type: {
    label: "Ring Type",
    hint: "Style of the ring on the stem.",
    type: "select",
    options: [
      { value: "c", label: "Cobwebby" },
      { value: "e", label: "Evanescent" },
      { value: "f", label: "Flaring" },
      { value: "l", label: "Large" },
      { value: "n", label: "None" },
      { value: "p", label: "Pendant" },
      { value: "s", label: "Sheathing" },
      { value: "z", label: "Zone" }
    ]
  },
  spore_print_color: {
    label: "Spore Print Color",
    hint: "Color left by spores (if known).",
    type: "select",
    options: [
      { value: "k", label: "Black" },
      { value: "n", label: "Brown" },
      { value: "b", label: "Buff" },
      { value: "h", label: "Chocolate" },
      { value: "r", label: "Green" },
      { value: "o", label: "Orange" },
      { value: "u", label: "Purple" },
      { value: "w", label: "White" },
      { value: "y", label: "Yellow" }
    ]
  },
  population: {
    label: "How Many Nearby",
    hint: "How mushrooms were grouped where found.",
    type: "select",
    options: [
      { value: "a", label: "Abundant" },
      { value: "c", label: "Clustered" },
      { value: "n", label: "Numerous" },
      { value: "s", label: "Scattered" },
      { value: "v", label: "Several" },
      { value: "y", label: "Solitary" }
    ]
  },
  habitat: {
    label: "Place Found",
    hint: "Main environment where the mushroom was found.",
    type: "select",
    options: [
      { value: "g", label: "Grasses" },
      { value: "l", label: "Leaves" },
      { value: "m", label: "Meadows" },
      { value: "p", label: "Paths" },
      { value: "u", label: "Urban" },
      { value: "w", label: "Waste" },
      { value: "d", label: "Woods" }
    ]
  }
} as const;

export function getFeatureLabel(name: string) {
  const map = fieldMeta as Record<string, { label: string }>;
  return map[name]?.label ?? name;
}

export function getFeatureValueLabel(name: string, value: string) {
  const map = fieldMeta as Record<string, { options?: Array<{ value: string; label: string }> }>;
  const option = map[name]?.options?.find((item) => item.value === value);
  return option?.label ?? value;
}
