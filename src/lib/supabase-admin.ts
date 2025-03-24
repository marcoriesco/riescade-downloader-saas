
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente Supabase com permissões elevadas (somente para uso em API routes, não no client)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Função para obter o email do usuário via admin
export async function getUserEmailById(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !data?.user?.email) {
      console.error("Erro ao obter email do usuário:", error);
      return null;
    }

    return data.user.email;
  } catch (error) {
    console.error("Erro ao acessar API de admin do Supabase:", error);
    return null;
  }
}

// Função alternativa para obter email usando o cliente público
// Útil se o cliente admin falhar ou não tiver a key de serviço configurada
export async function getUserEmailFromProfile(
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles") // Assumindo que existe uma tabela 'profiles' com os emails dos usuários
      .select("email")
      .eq("id", userId)
      .single();

    if (error || !data?.email) {
      console.error("Erro ao obter email do perfil do usuário:", error);
      return null;
    }

    return data.email;
  } catch (error) {
    console.error("Erro ao acessar perfil do usuário:", error);
    return null;
  }
}

// Adiciona informações de assinatura para um usuário específico
export async function updateUserSubscriptionStatus(userId: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao atualizar status da assinatura:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar assinatura:", error);
    return false;
  }
}
