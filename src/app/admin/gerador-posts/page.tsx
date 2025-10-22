"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function GeradorPosts() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Novo estado para feedback
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [iaLoading, setIaLoading] = useState(false);

  // Checa login e e-mail
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/");
        return;
      }
      if (data.user.email === "riescao@gmail.com") {
        setAuthorized(true);
      } else {
        router.replace("/");
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  // Preview da imagem
  useEffect(() => {
    if (!imagem) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imagem);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imagem]);

  // Função para submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      if (!titulo || !resumo || !conteudo || !imagem) {
        setStatus("Preencha todos os campos.");
        setSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append("title", titulo);
      formData.append("excerpt", resumo);
      formData.append("content", conteudo);
      formData.append("image", imagem);
      const res = await fetch("/api/publish-post", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("Post criado com sucesso!");
        setTitulo("");
        setResumo("");
        setConteudo("");
        setImagem(null);
        setPreview(null);
      } else {
        setStatus(data.error || "Erro ao criar post.");
      }
    } catch {
      setStatus("Erro inesperado ao criar post.");
    }
    setSubmitting(false);
  };

  // Função para gerar com IA
  const handleIaGenerate = async () => {
    setStatus(null);
    setIaLoading(true);
    try {
      if (!prompt) {
        setStatus("Digite um tema para gerar o post.");
        setIaLoading(false);
        return;
      }
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTitulo(data.titulo || "");
        setResumo(data.resumo || "");
        setConteudo(data.conteudo || "");
        setStatus("Post gerado com sucesso!");
      } else {
        setStatus(data.error || "Erro ao gerar post com IA.");
      }
    } catch {
      setStatus("Erro inesperado ao gerar post com IA.");
    }
    setIaLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }
  if (!authorized) {
    return <div className="p-8 text-center text-red-500">Acesso restrito</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Gerador Manual de Posts</h1>
      {/* Campo de prompt e botão IA */}
      <div className="mb-6 flex flex-col gap-2">
        <label className="font-semibold">Tema/Prompt para IA</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 rounded bg-gray-800 border border-gray-700"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: História do Atari 2600"
          />
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 font-bold text-white disabled:opacity-60"
            onClick={handleIaGenerate}
            disabled={iaLoading || !prompt}
          >
            {iaLoading ? "Gerando..." : "Gerar com IA"}
          </button>
        </div>
      </div>
      <form
        className="space-y-6"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div>
          <label className="block mb-1 font-semibold">Título</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Resumo</label>
          <textarea
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={2}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Conteúdo</label>
          <textarea
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={8}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Imagem destacada</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImagem(e.target.files[0]);
              }
            }}
            required
          />
          {preview && (
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={192}
              className="mt-2 max-h-48 rounded object-cover"
              unoptimized
            />
          )}
        </div>
        {status && (
          <div
            className="text-center py-2 font-semibold text-sm"
            style={{
              color: status.includes("sucesso") ? "#22c55e" : "#f87171",
            }}
          >
            {status}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded bg-[#ff0884] hover:bg-[#ff0884]/90 font-bold text-white mt-4 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Salvando..." : "Salvar Post"}
        </button>
      </form>
    </div>
  );
}
