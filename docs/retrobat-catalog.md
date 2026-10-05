# Catálogo para RetroBat

`npm run sync-google-drive` sincroniza o índice do Drive e depois exporta todas
as ROMs ativas compatíveis para `public/catalogs/retrobat.json`.
`npm run sync-google-drive -- snes` também exporta o catálogo completo depois
de sincronizar apenas SNES.

Para gerar o arquivo usando somente o índice existente, sem modificar o banco:
`node scripts/sync-google-drive.mjs --catalog-only` (passar diretamente ao Node
evita versões do npm que descartam esse argumento).

O JSON tem schema_version, revision SHA-256, total, plataformas com jogos e
assets (id, platform, title, download_name, file_size, md5, sha256,
install_mode e launch_path).
Não contém links do Drive, identificadores do Drive, credenciais ou sessões.
Os downloads continuam sujeitos à autorização e assinatura pela API existente.

Somente a exportação interna consulta o índice; ela exige o mesmo segredo da
sincronização. O cliente baixa um único arquivo em `/catalogs/retrobat.json`.
O arquivo anterior só é substituído depois de uma exportação bem-sucedida.
Pacotes `.extract.zip` são incluídos como install_mode=extract, com o nome
do pacote separado da entrada de lançamento. Daphne usa `<nome>.daphne`,
Singe usa `roms/<nome>.zip` e Namco 2x6 usa `<nome>.acgame`.
Outros sistemas usam as convenções de extensão do catálogo. O cliente
confere se a entrada prevista existe dentro do ZIP antes de instalar.
Nomes incompatíveis são excluídos. `_media.zip` permanece fora de assets,
mas é exportado em media, com id, platform, download_name, file_size e hashes,
somente para sistemas com jogos no catálogo. A revision também inclui media.
O cliente nativo baixa somente a mídia do sistema aberto no primeiro game-start
e reutiliza o pacote/preparação nos próximos jogos desse sistema.

Se o comando for executado em uma máquina de desenvolvimento, publique o
arquivo gerado junto com o site para atualizar a URL de produção. O comando
não publica nem faz deploy automaticamente.
