import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import React from "react";

// Rota para gerar uma imagem OpenGraph de fallback quando a imagem original não pode ser acessada
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "RIESCADE Blog";

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 50,
            color: "white",
            background: "linear-gradient(to bottom, #151515, #303030)",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 30, color: "#ff0884" }}>RIESCADE Blog</div>
          </div>

          <div style={{ fontWeight: "bold", marginTop: 80, maxWidth: "80%" }}>
            {decodeURIComponent(title)}
          </div>

          <div style={{ display: "flex", marginTop: 40 }}>
            <div
              style={{
                fontSize: 24,
                backgroundColor: "#ff0884",
                color: "white",
                padding: "8px 16px",
                borderRadius: 20,
              }}
            >
              Blog
            </div>

            <div
              style={{
                fontSize: 24,
                marginLeft: 20,
                display: "flex",
                alignItems: "center",
                color: "#ccc",
              }}
            >
              www.riescade.com.br
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("Erro ao gerar imagem OG de fallback:", e);
    // Se houver erro na geração, retornar uma resposta vazia
    return new Response("Erro ao gerar imagem", { status: 500 });
  }
}

// Configuração para o Edge runtime
export const runtime = "edge";
