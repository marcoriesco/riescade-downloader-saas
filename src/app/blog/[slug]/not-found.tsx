import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Postagem não encontrada</h1>
      <p className="mb-8 text-xl max-w-lg">
        Não foi possível encontrar a postagem solicitada. Ela pode ter sido
        removida ou o link pode estar incorreto.
      </p>
      <Link
        href="/blog"
        className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
      >
        Voltar para o Blog
      </Link>
    </div>
  );
}
