# RIESCADE Amigos — backend de desenvolvimento

Branch: `feature/riescade-amigos`.

## Entregue nesta etapa

- Migração `20261001160000_add_riescade_friends.sql` com perfil social próprio,
  código de amizade, relação única por par, bloqueios e quota persistente.
- API `GET/POST/PUT /api/app/friends`, autenticada pela sessão já existente.
- Operações de solicitação, aceite, recusa, cancelamento, remoção, bloqueio
  e desbloqueio; transições atômicas com lock por par.
- Busca por código exato; nomes editáveis de até 40 caracteres; e-mails e
  metadados privados da conta não aparecem no perfil social.
- Somente o servidor acessa tabelas/RPC. RLS habilitada e privilégios explícitos;
  `anon` e `authenticated` não recebem acesso direto. A RPC usa SECURITY INVOKER
  e recebe o ator exclusivamente do resultado de `authenticateAppRequest`.
- Limite de 20 novas solicitações por hora por conta, mantido após cancelamentos.
- Flag `RIESCADE_FRIENDS_ENABLED=false` por padrão; nenhuma migração remota aplicada.

## Contratos

Todos usam `Authorization: Bearer <sessão RIESCADE>` e respostas `no-store`.

- `GET /api/app/friends`: cria o perfil social no primeiro acesso e retorna
  perfil próprio, amizades/solicitações e bloqueios feitos pelo próprio usuário.
- `GET /api/app/friends?page=1`: paginação de 100 relações/bloqueios; `hasMore`
  indica que há outra página. O desktop agrega registros pelos identificadores.
- `GET /api/app/friends?code=0123456789ABCDEF`: busca pelo código exato; bloqueios
  em qualquer direção e código inexistente retornam a mesma indisponibilidade.
- `POST /api/app/friends` com `{ "action": "request", "targetCode": "..." }`.
  Ações: `request`, `accept`, `decline`, `cancel`, `remove`, `block`, `unblock`.
- `PUT /api/app/friends` com `{ "displayName": "Marco" }`: altera somente o
  nome do usuário autenticado. UUID/código de perfil não são editáveis na API.

## Testes

`npm run test` e `npm run typecheck`.

`friends.database.test.ts` executa a migração real em Postgres PGlite em memória,
com roles e tabela de identidade fictícias. Verifica autorização dos estados,
quotas, unicidade, bloqueios, constraints e negação de acesso direto a clientes.
Não acessa a configuração `.env.local` nem o banco do projeto.

`route.test.ts` verifica ator derivado da autenticação, flag, sessão expirada,
inputs inválidos, limite do corpo, cache e ausência de detalhes de erros internos.

PGlite utiliza uma conexão exclusiva. Os testes não demonstram concorrência em
um servidor Supabase real; antes da ativação externa, testar solicitações/bloqueios
simultâneos e verificar a migração no ambiente de desenvolvimento completo.

Validação atual: 66 testes do site passaram; typecheck
e lint passaram. O build Next.js concluiu e incluiu `/api/app/friends`; durante
a geração de páginas, a consulta existente aos posts do blog falhou por restrição
de rede do sandbox. Isso não valida o conteúdo gerado do blog neste build local.

## Ativação em desenvolvimento

1. Aplicar a migração somente no projeto de desenvolvimento.
2. Confirmar grants/RLS e rodar os fluxos com duas contas de teste.
3. Definir `RIESCADE_FRIENDS_ENABLED=true` no servidor de desenvolvimento.
4. Iniciar o site local. No desktop não empacotado, definir
   `RIESCADE_FRIENDS_API_URL=http://127.0.0.1:3000` antes de iniciar o aplicativo.
   Essa opção também direciona o login desktop para o servidor local, aceita
   somente loopback e é ignorada em builds empacotados. Configurar OAuth/redirects
   para desenvolvimento; não usar a configuração do banco de produção.
5. Abrir Jogar online → Amigos. Cada conta cria seu perfil ao abrir a aba.
6. No desktop compilado não empacotado, `npm run friends:profile -- host` e
   `npm run friends:profile -- guest` usam sessões separadas no mesmo PC.
   Concluir cada login antes de iniciar o seguinte. Biblioteca e configurações
   de jogos continuam compartilhadas. Esse ensaio valida o fluxo social;
   netplay em redes diferentes depende de relay e de dois computadores.

Não ativar essa flag em produção antes de validar migração e proteção contra
abuso de busca/listagem. Solicitações já possuem quota; os outros endpoints
ainda precisam de rate limiting distribuído para lançamento público.

## Ainda pendente

Eventos contínuos, validação
completa de compatibilidade, lançamento das salas, transporte autenticado/cifrado
e relay externo. O protótipo de conexão
nativa no aplicativo funciona somente no ensaio local; não compõe ainda um
fluxo automático de convite até a partida.

## Presença e convites: incremento local

A migração `20261001165952_add_social_presence_and_invitations.sql` adiciona
presença por dispositivo (expiração em 75 segundos), preferência global de
invisibilidade, convites com expiração em dois minutos e salas de preparação com
expiração em cinco minutos. `/api/app/friends/sessions` usa a identidade do token,
sem confiar em IDs de ator do corpo. Bloqueio ou remoção da amizade cancela as
salas e convites do par. Aceitação repetida não cria outra sala.

Após abrir Amigos com sucesso, o processo principal do desktop consulta e envia
heartbeat a cada 30 segundos, inclusive fora da aba. Encerra o ciclo ao trocar
conta, expirar a sessão ou fechar o aplicativo, e descarta respostas antigas.
Notificações globais e estado Jogando ainda precisam de integração. A tela
permite mudar presença, responder convites e sair de salas.
O desktop permite buscar até 100 jogos locais por pesquisa e enviar convites
para amigos confirmados. O processo principal resolve uma chave temporária da
biblioteca, revalida jogo/core e calcula SHA-256 do conteúdo, core e RetroArch.
Não transmite caminhos nem aceita um manifesto enviado pelo renderer. Playlists
e descritores de discos com múltiplos arquivos ficam fora desta etapa. Uma
tentativa repetida reutiliza o ID do convite para evitar duplicação após falha
de rede. A preparação é interrompida se a conta mudar durante o cálculo.
Nenhum desses controles inicia emuladores. O estado `validating` representa uma
sala de preparação; ainda não executa verificação automática de compatibilidade.

Testes locais cobrem TTL, invisibilidade, permissões, quota de convites,
idempotência, bloqueio e impedimento de salas simultâneas. A expiração ocorre nas
leituras e ações; a limpeza periódica das linhas antigas precisa ser definida
antes da ativação externa. As duas migrações continuam sem aplicação remota.
# Fluxo jogável: atualização

A terceira migração `20261001175531_add_private_room_runtime.sql` implementa
prontidão por dispositivo, claims únicos, sessão privada e fases de partida.
`/api/app/friends/sessions` recebe a ação `room` com ator derivado do login.
`/api/app/friends/relay` exige control key do serviço e verifica tickets assinados
contra a sala/dispositivos ativos. O desktop agora lança NES/FCEUmm depois da
confirmação dos dois jogadores e usa relay próprio com TLS. As limitações de
preparação sem lançamento descritas abaixo pertencem aos incrementos anteriores.
O guia atual está em `docs/RIESCADE-AMIGOS-TESTES.md` no repositório do desktop.

Configurar `RIESCADE_RELAY_HOST`, `RIESCADE_RELAY_PORT`, `RIESCADE_RELAY_SIGNING_KEY`
e `RIESCADE_RELAY_CONTROL_KEY` somente no servidor. Segredos independentes com
pelo menos 32 caracteres. Host/porta são configuração administrativa, nunca
argumentos livres fornecidos pelo renderer. A chave de assinatura não existe no
relay; a control key do relay permite validar tickets junto à API. As três
migrações continuam locais, sem aplicação remota ou publicação.
