import { supabase } from "@/integrations/supabase/client";
import { FishType } from "@/types/fishe-types";
import { toast } from "sonner";

export async function awardFishToUser(userId: string, fishName: FishType) {
  try {
    // 1) Fetch the normal fish row from marine_species using fishName
    const { data: normalData, error: normalError } = await supabase
      .from("marine_species")
      .select("id")
      .eq("name", fishName)
      .single();

    if (normalError || !normalData) {
      console.error(
        `Error fetching ${fishName} from marine_species:`,
        normalError?.message
      );
      return;
    }
    const normalId = normalData.id;

    // 2) Fetch the shiny variant row
    const shinyName = `Shiny ${fishName}`;
    const { data: shinyData, error: shinyError } = await supabase
      .from("marine_species")
      .select("id")
      .eq("name", shinyName)
      .single();

    if (shinyError || !shinyData) {
      console.error(
        `Error fetching ${shinyName} from marine_species:`,
        shinyError?.message
      );
      return;
    }
    const shinyId = shinyData.id;

    // 3) Check if the user already owns the normal variant
    const { data: existingNormal, error: normalUserError } = await supabase
      .from("user_marine_species")
      .select("id")
      .eq("user_id", userId)
      .eq("species_id", normalId)
      .maybeSingle();

    if (normalUserError) {
      console.error(
        `Error checking existing ${fishName}:`,
        normalUserError.message
      );
      return;
    }
    const hasNormal = !!existingNormal;

    // 4) Check if the user already owns the shiny variant
    const { data: existingShiny, error: shinyUserError } = await supabase
      .from("user_marine_species")
      .select("id")
      .eq("user_id", userId)
      .eq("species_id", shinyId)
      .maybeSingle();

    if (shinyUserError) {
      console.error(
        `Error checking existing ${shinyName}:`,
        shinyUserError.message
      );
      return;
    }
    const hasShiny = !!existingShiny;

    // 5) Decide which variant to award:
    // - If the user has neither variant: 90% chance for normal, 10% for shiny.
    // - If the user already has the normal variant but not the shiny variant: 10% chance for shiny.
    // - Otherwise, no award.
    let variantToAward: "normal" | "shiny" | null = null;
    if (!hasNormal && !hasShiny) {
      const roll = Math.random();
      variantToAward = roll < 0.1 ? "shiny" : "normal";
    } else if (hasNormal && !hasShiny) {
      const roll = Math.random();
      variantToAward = roll < 0.1 ? "shiny" : null;
    } else {
      // Either user already has shiny, or has both variants.
      variantToAward = null;
    }

    if (!variantToAward) {
      console.log(`User already has the awarded variant(s) of ${fishName}.`);
      return;
    }

    const speciesId = variantToAward === "normal" ? normalId : shinyId;
    const awardedVariantName =
      variantToAward === "normal" ? fishName : shinyName;

    // 6) Insert the awarded fish into the user's collection
    const { error: insertError } = await supabase
      .from("user_marine_species")
      .insert({
        user_id: userId,
        species_id: speciesId,
      });

    if (insertError) {
      console.error(
        `Error awarding ${awardedVariantName}:`,
        insertError.message
      );
    } else {
      console.log(`${awardedVariantName} awarded to user:`, userId);
      toast.success(`Congrats! You won a ${awardedVariantName}!`, {
        description: "Check your Pokedex to see it in your collection.",
        duration: 3000, // 3 seconds
      });
    }
  } catch (err) {
    console.error(`Unexpected error awarding ${fishName}:`, err);
  }
}
