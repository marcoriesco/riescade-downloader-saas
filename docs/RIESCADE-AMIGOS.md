# Amigos e partidas diretas

O desktop usa a sessão autenticada do RIESCADE para perfis, amizades, presença e convites. A API publica uma sessão privada identificada quando o anfitrião abre o RetroArch. O convite referencia essa sessão; somente seu destinatário, após aceitar, pode obter endereço, porta e senha.

As partidas usam TCP diretamente entre o convidado e o anfitrião, sem relay. Uma senha aleatória de 24 bytes é gerada para cada sala. O adaptador DirectNetplayConnection responde à autenticação no computador do convidado, porque o RetroArch sempre solicita a senha interativamente. Após a autenticação, os pacotes seguem sem alteração ao host.

O host precisa de IPv4 público e porta acessível: firewall permitido, UPnP funcional ou encaminhamento TCP no roteador. A verificação local de prontidão não confirma acesso pela Internet. Em CGNAT, use um host acessível ou solicite IP público à operadora.

Aplique a migração direct_retroarch_invites antes de publicar a API e distribuir o desktop atualizado. Salas de versões antigas não podem ser reutilizadas; o protocolo antigo e o endpoint de relay retornam HTTP 410. Nenhuma variável RIESCADE_RELAY ou serviço de relay é necessária.

As tabelas e funções continuam restritas ao service_role. O snapshot público contém identificações e estado dos convites, sem senha ou endereço da conexão. A consulta da conexão verifica destinatário, aceite, amizade, cancelamento, validade e encerramento da sessão.

Validação: testes da API e migração em PGlite, typecheck no site e desktop, e teste nativo de dois RetroArch com jogo NES sintético. O teste local confirma entrada automática com senha correta e rejeição da senha incorreta. Homologar também com duas contas em redes diferentes.
