import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("id");

  if (!postId) {
    return NextResponse.json(
      { error: "ID do post é obrigatório" },
      { status: 400 }
    );
  }

  try {
    // Buscar visualizações atuais
    const { data: post, error: fetchError } = await supabaseAdmin
      .from("blog_posts")
      .select("views")
      .eq("id", postId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Incrementar views
    const currentViews = post?.views || 0;
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .update({ views: currentViews + 1 })
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, views: currentViews + 1 });
  } catch (err) {
    console.error("Erro ao atualizar visualizações:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
