import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // <-- Import from Sonner

export async function awardBabyWhaleToUser(userId: string) {
  try {
    // 1) Get the baby whale row from marine_species
    const { data: whaleData, error: whaleError } = await supabase
      .from("marine_species")
      .select("id")
      .eq("name", "Baby Whale")
      .single();

    if (whaleError || !whaleData) {
      console.error(
        "Error fetching Baby Whale from marine_species:",
        whaleError?.message
      );
      return;
    }

    const babyWhaleId = whaleData.id;

    // 2) Check if user already owns baby whale
    const { data: existing, error: checkError } = await supabase
      .from("user_marine_species")
      .select("id")
      .eq("user_id", userId)
      .eq("species_id", babyWhaleId)
      // maybeSingle() avoids 406 errors if zero or multiple rows
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing baby whale:", checkError.message);
    }

    // If the user doesn't own the baby whale yet, insert it
    if (!existing) {
      const { error: insertError } = await supabase
        .from("user_marine_species")
        .insert({
          user_id: userId,
          species_id: babyWhaleId,
        });

      if (insertError) {
        console.error("Error awarding Baby Whale:", insertError.message);
      } else {
        console.log("Baby Whale awarded to user:", userId);

        // 3) Show a 3-second toast popup
        toast.success("Congrats! You won a Baby Whale!", {
          description: "Check your Pokedex to see it in your collection.",
          duration: 3000, // 3 seconds
        });
      }
    } else {
      console.log("User already has Baby Whale.");
    }
  } catch (err) {
    console.error("Unexpected error awarding Baby Whale:", err);
  }
}
