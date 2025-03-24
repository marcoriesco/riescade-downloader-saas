
import { createClient } from "@supabase/supabase-js";
import { addUserPermission, removeUserPermission } from "@/integrations/google/drive";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  plan_id: string;
  subscription_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  trial_start: string;
  trial_end: string;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }

  return data;
}

// Adiciona permissão de acesso ao Google Drive do usuário quando a assinatura estiver ativa
export async function addDriveAccessForUser(email: string): Promise<boolean> {
  try {
    if (!email) {
      console.error("Email não fornecido para adicionar acesso ao Drive");
      return false;
    }
    
    const folderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID;
    
    if (!folderId) {
      console.error("ID da pasta do Google Drive não configurado");
      return false;
    }
    
    const result = await addUserPermission(email, folderId, "reader");
    
    if (result.success) {
      console.log(`Acesso ao Drive concedido para ${email}`);
      return true;
    } else {
      console.error(`Falha ao adicionar permissão ao Drive para ${email}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error("Erro ao adicionar acesso ao Drive:", error);
    return false;
  }
}

// Remove permissão de acesso ao Google Drive quando a assinatura for cancelada
export async function removeDriveAccessForUser(email: string): Promise<boolean> {
  try {
    if (!email) {
      console.error("Email não fornecido para remover acesso ao Drive");
      return false;
    }
    
    const folderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID;
    
    if (!folderId) {
      console.error("ID da pasta do Google Drive não configurado");
      return false;
    }
    
    const result = await removeUserPermission(email, folderId);
    
    if (result.success) {
      console.log(`Acesso ao Drive removido para ${email}`);
      return true;
    } else {
      console.error(`Falha ao remover permissão do Drive para ${email}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error("Erro ao remover acesso ao Drive:", error);
    return false;
  }
}
