import { supabase } from "./supabase";
import type { Inflatable } from "./types";

export async function getInflatables(): Promise<Inflatable[]> {
  const { data, error } = await supabase
    .from("inflatables")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Inflatable[];
}

export async function getInflatableBySlug(
  slug: string
): Promise<Inflatable | null> {
  const { data, error } = await supabase
    .from("inflatables")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Inflatable) ?? null;
}
