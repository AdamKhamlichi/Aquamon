import { supabase } from "@/integrations/supabase/client";
import { FishType } from "@/types/fishe-types";
import { toast } from "sonner";

export async function awardFishToUser(userId: string, fishName: FishType) {
  try {
    // 1) First check if user already has either variant
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

    // PGRST116 is the "no rows returned" error code, which is expected when the user doesn't have the fish
    if (normalCheckError?.code !== "PGRST116" && normalCheckError) {
      console.error("Error checking existing normal fish:", normalCheckError);
      return;
    }
    if (shinyCheckError?.code !== "PGRST116" && shinyCheckError) {
      console.error("Error checking existing shiny fish:", shinyCheckError);
      return;
    }

    // If user has both variants, exit
    if (existingNormal && existingShiny) {
      console.log("User already has both variants");
      return;
    }

    // 2) Determine which variant to award
    let variantToAward: "normal" | "shiny" | null = null;
    if (!existingNormal && !existingShiny) {
      variantToAward = Math.random() < 0.1 ? "shiny" : "normal";
    } else if (existingNormal && !existingShiny) {
      variantToAward = Math.random() < 0.1 ? "shiny" : null;
    } else if (!existingNormal && existingShiny) {
      variantToAward = Math.random() < 0.5 ? "normal" : null;
    }

    if (!variantToAward) {
      console.log("No new variant to award");
      return;
    }

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
