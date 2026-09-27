"use client";

import { PageIntro } from "@/components/PageIntro";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Download,
  File,
  FolderOpen,
  Play,
  FileType,
  Archive,
  MonitorPlay,
  MoveRight,
  Share2,
} from "lucide-react";

export default function TutorialPage() {
  return (
    <div className="flex flex-col site-page min-h-screen bg-background text-white">
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-gray-900 to-gray-900"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <PageIntro eyebrow="Guia de instalação" title={<>Tudo pronto para <span className="text-gradient-primary">jogar.</span></>} description="Siga as etapas de instalação e configuração da sua coleção." />
            <aside className="mb-8 rounded-2xl border border-primary/25 bg-primary/5 p-6"><h2 className="font-display text-xl font-bold">Usando o RIESCADE OS?</h2><p className="mt-2 text-muted-foreground">Acesse sua conta para baixar o aplicativo. O guia abaixo se refere à coleção legada baseada em Retrobat e arquivos compactados.</p><Link href="/dashboard" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-accent">Acessar minha conta</Link></aside>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 shadow-xl">
              <p className="text-lg text-foreground/80 mb-8 max-w-3xl mx-auto text-center">
                Siga o passo a passo abaixo para começar a utilizar sua coleção
                de jogos. Se tiver alguma dúvida, entre em contato com nosso
                suporte.
              </p>

              {/* Passo 1 */}
              <div className="mb-10">
                <div className="flex items-center p-4 bg-card/70 rounded-t-lg border border-border border-b-0">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white">
                      Download e Extração dos Arquivos Base
                    </h3>
                  </div>
                </div>

                <div className="p-6 bg-card/30 rounded-b-lg border border-border">
                  <div className="flex items-start mb-6">
                    <Download className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Faça download de todos os arquivos{" "}
                      <span className="bg-card text-white px-2 py-1 rounded">
                        RIESCADE_BASE.7z
                      </span>{" "}
                      na pasta RIESCADE_BASE e extraia em algum local do seu PC.
                    </p>
                  </div>
                  <div className="flex items-start mb-4">
                    <FileType className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Note que temos um executável na raiz dessa pasta{" "}
                      <span className="bg-card text-white px-2 py-1 rounded">
                        Retrobat.exe
                      </span>
                      , com esse arquivo que você executará o sistema.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <MonitorPlay className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      O sistema já vem com 01 (um) jogo em cada plataforma para
                      você testar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="mb-10">
                <div className="flex items-center p-4 bg-card/70 rounded-t-lg border border-border border-b-0">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white">
                      Download de Jogos Adicionais
                    </h3>
                  </div>
                </div>

                <div className="p-6 bg-card/30 rounded-b-lg border border-border">
                  <div className="flex items-start mb-6">
                    <FolderOpen className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Entrar no drive, procurar pela pasta{" "}
                      <span className="bg-card text-white px-2 py-1 rounded">
                        ROMS
                      </span>
                      , escolher a plataforma que quer baixar e fazer download.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Share2 className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Note que algumas plataformas estão descompactadas, pois os
                      jogos são grandes.
                      <br />
                      Exemplo: Nintendo Switch e Xbox 360.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="mb-10">
                <div className="flex items-center p-4 bg-card/70 rounded-t-lg border border-border border-b-0">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white">
                      Instalação dos Jogos
                    </h3>
                  </div>
                </div>

                <div className="p-6 bg-card/30 rounded-b-lg border border-border">
                  <div className="flex items-start mb-6">
                    <Archive className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Para instalação dos jogos, depois de feito o download, só
                      copiar/colar nas respectivas pastas que estão dentro de
                      roms.
                    </p>
                  </div>
                  <div className="flex items-start mb-6">
                    <MoveRight className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div className="text-foreground/80">
                      <p>Exemplo:</p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>
                          Nintendo Switch ={" "}
                          <span className="bg-card text-white px-2 py-1 rounded">
                            switch
                          </span>
                        </li>
                        <li>
                          Xbox 360 ={" "}
                          <span className="bg-card text-white px-2 py-1 rounded">
                            xbox360
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <File className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Fazer download também do arquivo{" "}
                      <span className="bg-card text-white px-2 py-1 rounded">
                        _medium_artwork.7z
                      </span>{" "}
                      e{" "}
                      <span className="bg-card text-white px-2 py-1 rounded">
                        gamelist.xml
                      </span>
                      . O arquivo medium_artwork geralmente está compactado,
                      descompacte o arquivo dentro da pasta da plataforma
                      escolhida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="mb-10">
                <div className="flex items-center p-4 bg-card/70 rounded-t-lg border border-border border-b-0">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white">
                      Estrutura de Pastas
                    </h3>
                  </div>
                </div>

                <div className="p-6 bg-card/30 rounded-b-lg border border-border">
                  <p className="text-foreground/80 mb-4">
                    Exemplo de como deve ficar a pasta, dando como exemplo a
                    plataforma Atari 2600:
                  </p>
                  <div className="bg-background p-4 rounded-lg font-mono text-sm mb-6">
                    <div className="text-blue-400">📁 roms</div>
                    <div className="ml-4 text-yellow-400">📁 atari2600</div>
                    <div className="ml-8 text-green-400">
                      📁 _medium_artwork
                    </div>
                    <div className="ml-12 text-muted-foreground">🖼️ imagem1.png</div>
                    <div className="ml-12 text-muted-foreground">🖼️ imagem2.png</div>
                    <div className="ml-8 text-purple-400">📄 gamelist.xml</div>
                    <div className="ml-8 text-red-400">🎮 jogo1.rom</div>
                    <div className="ml-8 text-red-400">🎮 jogo2.rom</div>
                  </div>
                </div>
              </div>

              {/* Passo 5 */}
              <div className="mb-10">
                <div className="flex items-center p-4 bg-card/70 rounded-t-lg border border-border border-b-0">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white">
                      Executando o Sistema
                    </h3>
                  </div>
                </div>

                <div className="p-6 bg-card/30 rounded-b-lg border border-border">
                  <div className="flex items-start mb-6">
                    <Play className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Finalmente, agora para executar o sistema é só clicar 2
                      vezes no executável explicado no Passo 1.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FolderOpen className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">
                      Na pasta{" "}
                      <span className="bg-card text-white px-2 py-1 rounded">
                        _apps
                      </span>
                      , você encontra todos os arquivos necessários para que seu
                      Windows possa rodar o RIESCADE.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de Suporte */}
              <div className="mt-10 text-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-base font-bold rounded-md shadow-[0_0_20px_rgba(255,8,132,0.4)] text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105"
                >
                  Voltar ao Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
