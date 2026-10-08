import type { SupabaseClient } from "@supabase/supabase-js";
import { AppApiError } from "./app-errors";
/** Legacy room protocol is retired; current invitations target a direct hosted session. */
export async function roomStep(
  _db: SupabaseClient,
  _actor: string,
  _body: Record<string, unknown>,
): Promise<never> {
  void _db; void _actor; void _body;
  throw new AppApiError(
    410,
    "Este convite é de uma versão antiga. Crie uma sala direta e envie um novo convite.",
  );
}
