import Link from 'next/link';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { PageIntro } from '@/components/PageIntro';

export default function NotFound() {
  return (
    <div className="site-page flex min-h-screen flex-col">
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-6">
        <PageIntro eyebrow="Blog / 404" title="Artigo não encontrado" description="Este artigo pode ter sido removido ou o endereço pode estar incorreto." />
        <Link href="/blog" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-accent">Explorar o blog</Link>
      </main>
      <Footer />
    </div>
  );
}
