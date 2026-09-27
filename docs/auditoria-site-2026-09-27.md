# Auditoria e redesenho do site — 27/09/2026

## Escopo

Auditoria do código e da experiência visual das páginas Next.js ligadas à home. Implementação local, sem publicação. Inclui os modelos de artigos, categorias e plataformas; não representa uma inspeção individual de cada registro do catálogo. APIs, banco, permissões, contratos e pagamentos não foram alterados nem submetidos a uma auditoria de segurança completa.

## Cobertura do redesenho

| Página | Alterações |
| --- | --- |
| `/` | Tipografia consistente, foco, contraste, espaçamento do hero, imagens responsivas e cartões do blog |
| `/blog` | Nova abertura editorial, grid responsivo, cartões, filtros, busca acessível e paginação com quebra de linha |
| `/blog/[slug]` | Cabeçalho de leitura, volta ao blog, cores do conteúdo e correção do link de categoria |
| `/blog/category/[slug]` | Hierarquia visual, superfícies, tipografia e imagem de reserva válida |
| `/platforms` | Abertura do catálogo, busca e estado de entrada para visitantes |
| `/platforms/[platform]` | Cabeçalho, retorno ao catálogo, cartões, ações e imagem de reserva |
| `/dashboard` | Nova abertura da conta e unificação de perfil, assinatura e estados de acesso |
| `/tutorial` | Nova abertura, etapas com a identidade da home e identificação explícita do guia legado |
| `/politica`, `/termos`, `/app-data` | Aberturas compartilhadas, largura de leitura, cartões e contraste |
| `/app-politica` | Remoção do fundo azul/roxo, títulos e superfície coerentes com o site |
| `/app-login` | Identidade RIESCADE, retorno à home e anúncio acessível do estado do login |
| 404 geral e do blog | Navegação compartilhada e caminhos de recuperação |

## Problemas corrigidos

- Conteúdo sob o cabeçalho fixo: recuo superior compartilhado nas páginas internas.
- Paletas e fontes divergentes: tokens de fundo, cartões, bordas, texto e destaque reutilizados.
- Fontes externas incompatíveis com a CSP: removida a importação externa; pilha de fontes do sistema e marca com fonte local.
- Classes utilitárias redefinidas globalmente: removidas as alterações de `rounded-lg`, `rounded-md` e `rounded-none`.
- Navegação: catálogo e tutorial acessíveis no cabeçalho; rodapé reorganizado com links legais, conteúdo e comunidade.
- Menu mobile: nome acessível, estado expandido, fechamento por Escape e mudança de rota, limite de altura e rolagem.
- Teclado: link para pular ao conteúdo, destino focalizável e foco visível. Preferência por movimento reduzido respeitada.
- Blog: labels de busca, codificação dos filtros na paginação e página inválida normalizada para pelo menos 1.
- SEO: domínio incorreto do Open Graph do blog corrigido e canonical global que apontava todas as páginas para a home removido.
- Imagens locais inexistentes: capa de categoria, Open Graph do blog e reserva do console agora apontam para arquivos existentes.
- Verificação: `npm run lint` passou a executar `eslint src`, compatível com o projeto instalado.

## Validação executada

- TypeScript: aprovado (`npm run typecheck`).
- ESLint: aprovado sem avisos (`npm run lint`).
- Testes existentes: 23 testes aprovados em 4 arquivos (`npm test`). Esses testes cobrem serviços e autenticação de API, não são testes visuais.
- Build de produção: aprovado, incluindo geração das 27 páginas estáticas e acesso à rede para gerar o sitemap.
- HTTP: home, blog, privacidade, termos, exclusão, privacidade do app, tutorial, catálogo, detalhe SNES, dashboard, login do app e categoria responderam 200.
- Navegador: privacidade em desktop e viewport 390 × 844; blog em desktop e mobile; abertura do menu mobile, navegação ao blog e fechamento após seleção na versão de produção; estado anônimo do catálogo.
- Blog mobile: inspeção do DOM não encontrou elementos do conteúdo ultrapassando a largura do viewport.
- Acesso autenticado, assinatura, cancelamento e retorno ao aplicativo não foram exercitados com uma conta real.

## Achados que permanecem

1. **Ambiente de desenvolvimento:** a CSP existente bloqueia o `eval` usado pelo runtime de `next dev`. Evidência: `EvalError` no navegador e menu sem resposta. A versão de produção executou o menu normalmente. A política não foi relaxada; para reproduzir a prévia validada, usar `npm run build` e `npm run start`.
2. **Imagens remotas:** capas do blog usam serviços externos, incluindo Pollinations; algumas não estavam visíveis durante a inspeção. As correções de arquivos locais não garantem disponibilidade desses serviços. Migrar imagens editoriais para armazenamento controlado exige um trabalho próprio de conteúdo.
3. **Conteúdo legado:** o tutorial usa Retrobat, Drive e arquivos compactados. Foi adicionado um aviso e um caminho para baixar o RIESCADE OS na conta. Um guia completo do aplicativo atual depende de validar suas telas e o fluxo de instalação.
4. **Textos institucionais:** políticas e termos preservam datas e afirmações existentes, inclusive menções técnicas sobre tratamento de dados. A revisão visual não certifica a atualidade dessas afirmações.
5. **Metadados:** algumas páginas estáticas ainda herdam o título genérico da raiz; detalhes dinâmicos mantêm sua geração existente de metadados. Convém completar títulos e canonicals específicos em uma revisão de SEO.
6. **Next.js:** o build informa depreciação de `serverRuntimeConfig` e uma rota Edge sem geração estática. Não impedem o build atual.
7. **Autenticação no Header:** o cleanup do listener está retornado dentro da função assíncrona `checkUser`, e não do efeito React. Deve ser corrigido em uma revisão funcional da autenticação com validação de sessão; não foi alterado nesta mudança visual.

## Manutenção

`src/components/PageIntro.tsx` concentra a abertura das páginas e o link de ação. `src/app/globals.css` contém os tokens, a estrutura `site-page`, foco e movimento reduzido. Novas páginas devem reutilizar esses elementos para manter a identidade da home.
