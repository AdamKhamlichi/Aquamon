// File: src/communication/awardFishToUser.ts
import { supabase } from "@/integrations/supabase/client";
import { FishType } from "@/types/fishe-types";
import { toast } from "sonner";

export async function awardFishToUser(userId: string, fishName: FishType) {
  try {
    // 1) Fetch the fish row from marine_species by `fishName`
    const { data: fishData, error: fishError } = await supabase
      .from("marine_species")
      .select("id")
      .eq("name", fishName)
      .single();

    if (fishError || !fishData) {
      console.error(
        `Error fetching ${fishName} from marine_species:`,
        fishError?.message
      );
      return;
    }

    const fishId = fishData.id;

    // 2) Check if user already owns this fish
    const { data: existing, error: existingError } = await supabase
      .from("user_marine_species")
      .select("id")
      .eq("user_id", userId)
      .eq("species_id", fishId)
      .maybeSingle(); // avoids 406 if zero or multiple rows

    if (existingError) {
      console.error(
        `Error checking existing ${fishName}:`,
        existingError.message
      );
    }

    // 3) Insert if the user doesn't own it yet
    if (!existing) {
      const { error: insertError } = await supabase
        .from("user_marine_species")
        .insert({
          user_id: userId,
          species_id: fishId,
        });

      if (insertError) {
        console.error(`Error awarding ${fishName}:`, insertError.message);
      } else {
        console.log(`${fishName} awarded to user:`, userId);

        // 4) Show a 3-second toast popup
        toast.success(`Congrats! You won a ${fishName}!`, {
          description: "Check your Pokedex to see it in your collection.",
          duration: 3000, // 3 seconds
        });
      }
    } else {
      console.log(`User already has ${fishName}.`);
    }
  } catch (err) {
    console.error(`Unexpected error awarding ${fishName}:`, err);
  }
}
