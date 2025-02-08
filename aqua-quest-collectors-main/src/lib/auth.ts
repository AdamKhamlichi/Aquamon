
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AuthError = {
  message: string;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast.error(error.message);
    return { user: null, error };
  }

  return { user: data.user, error: null };
};

export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    toast.error(error.message);
    return { user: null, error };
  }

  return { user: data.user, error: null };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast.error(error.message);
  }
  return { error };
};
