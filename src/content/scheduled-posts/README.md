# Sistema de Automação de Posts do Blog

Este sistema permite agendar posts para serem publicados automaticamente em datas específicas, sem necessidade de intervenção manual.

## Estrutura de Arquivos

```
src/content/scheduled-posts/
│
├── images/                  # Pasta para armazenar imagens dos posts
│   ├── 8bit-consoles.jpg
│   ├── game-boy-history.jpg
│   └── ...
│
├── YYYY-WXX.json            # Arquivos JSON com posts agendados por semana (ex: 2023-W17.json)
└── README.md                # Este arquivo
```

## Formato do Arquivo JSON

Cada arquivo semanal (ex: `2023-W17.json` para a semana 17 de 2023) segue este formato:

```json
{
  "week": 17,
  "year": 2023,
  "posts": [
    {
      "title": "Título do Post",
      "publish_date": "2023-04-27",
      "content": "<p>Conteúdo HTML do post...</p>",
      "excerpt": "Resumo curto do post",
      "image_path": "nome-da-imagem.jpg",
      "category": "Categoria",
      "tags": ["tag1", "tag2"],
      "author": "Nome do Autor",
      "featured": false,
      "published": false
    }
    // ... mais posts
  ]
}
```

### Campos Obrigatórios

- `title`: Título do post
- `publish_date`: Data de publicação no formato YYYY-MM-DD
- `content`: Conteúdo completo do post em HTML

### Campos Opcionais

- `excerpt`: Resumo do post (será gerado automaticamente do conteúdo se não fornecido)
- `image_path`: Nome do arquivo de imagem na pasta `images/`
- `category`: Categoria do post (default: "General")
- `tags`: Array de tags
- `author`: Nome do autor (default: "RIESCADE Team")
- `author_image`: URL da imagem do autor
- `featured`: Se o post deve ser destacado (default: false)
- `published`: Status de publicação, atualizado automaticamente (default: false)

## Como Adicionar Novos Posts

1. Crie um arquivo JSON para a semana desejada (se ainda não existir)
2. Adicione as informações do post no formato acima
3. Coloque a imagem de capa na pasta `images/`
4. O sistema verificará diariamente se há posts programados para publicação

## Execução Automática

O script de publicação é executado todos os dias através de um cronjob que verifica se há posts agendados para a data atual. Para executar manualmente:

```bash
# Instalar dependências (uma vez)
npm install node-cron ts-node

# Iniciar o agendador
node src/scripts/cron-scheduler.js

# Ou executar diretamente o script de publicação
npx ts-node src/scripts/publish-scheduled-posts.ts
```

## Solução de Problemas

Se um post não for publicado conforme esperado, verifique:

1. O formato da data está correto (YYYY-MM-DD)
2. O arquivo JSON da semana está corretamente formatado
3. Os logs de erro em `logs/publish-errors.log`

## Organização Semanal

A organização semanal traz algumas vantagens:

1. Gerenciamento mais granular do conteúdo
2. Facilidade para modificar posts próximos sem afetar todo o mês
3. Arquivos menores e mais fáceis de editar
4. Melhor controle sobre temas de cada semana

## Sugestões de Temas

Para manter o blog consistente, sugerimos manter estes temas recorrentes:

- **Segundas**: História de consoles
- **Quintas**: História de arcades e fliperamas
- **Domingos**: História de portáteis ou curiosidades

## Geração de Conteúdo

Para gerar conteúdo para novas semanas:

1. Use o arquivo da semana anterior como modelo
2. Atualize as datas e conteúdo
3. Certifique-se de criar imagens correspondentes para cada post
4. Mantenha um equilíbrio entre categorias (Consoles, Arcades, Portáteis, etc.)
