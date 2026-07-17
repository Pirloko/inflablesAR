export type Inflatable = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  length_m: number;
  width_m: number;
  height_m: number;
  safety_margin_m: number;
  price_clp: number | null;
  age_range: string | null;
  capacity: string | null;
  power_required: boolean;
  photos: string[];
  model_url: string | null;
  active: boolean;
};
