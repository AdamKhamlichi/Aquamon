import { supabase } from "@/integrations/supabase/client";
import { FishType } from "@/types/fishe-types";
import { toast } from "sonner";

export async function awardFishToUser(userId: string, fishName: FishType) {
  try {
    // 1) Check if user already has either variant (normal or shiny)
    const { data: existingNormal, error: normalCheckError } = await supabase
      .from("user_marine_species")
      .select(
        `
        species_id,
        marine_species!inner (
          name
        )
      `
      )
      .eq("user_id", userId)
      .eq("marine_species.name", fishName)
      .single();

    const { data: existingShiny, error: shinyCheckError } = await supabase
      .from("user_marine_species")
      .select(
        `
        species_id,
        marine_species!inner (
          name
        )
      `
      )
      .eq("user_id", userId)
      .eq("marine_species.name", `Shiny ${fishName}`)
      .single();

    // When no row is found, Supabase returns an error with code "PGRST116".
    // We treat that as "not existing" and ignore it.
    const normalExists = !normalCheckError && existingNormal;
    const shinyExists = !shinyCheckError && existingShiny;

    // If the user already has either variant, exit without awarding
    if (normalExists || shinyExists) {
      console.log("User already has this fish.");
      return;
    }

    // 2) Since the user has neither variant, choose which variant to award.
    // Here we randomly choose shiny with a 10% chance.
    const variantToAward: "normal" | "shiny" =
      Math.random() < 0.1 ? "shiny" : "normal";

    // 3) Get the correct species ID
    const fishNameToAward =
      variantToAward === "shiny" ? `Shiny ${fishName}` : fishName;
    const { data: speciesData, error: speciesError } = await supabase
      .from("marine_species")
      .select("id")
      .eq("name", fishNameToAward)
      .single();

    if (speciesError || !speciesData) {
      console.error(
        `Error fetching species ID for ${fishNameToAward}:`,
        speciesError
      );
      return;
    }

    // 4) Award the fish
    const { error: insertError } = await supabase
      .from("user_marine_species")
      .insert({
        user_id: userId,
        species_id: speciesData.id,
      });

    if (insertError) {
      console.error(`Error awarding ${fishNameToAward}:`, insertError);
    } else {
      console.log(`${fishNameToAward} awarded to user:`, userId);
      toast.success(`Congrats! You won a ${fishNameToAward}!`, {
        description: "Check your Pokedex to see it in your collection.",
        duration: 3000,
      });
    }
  } catch (err) {
    console.error(`Unexpected error awarding ${fishName}:`, err);
  }
}
