import * as fs from "fs";
import * as path from "path";

// Configuração de caminhos
const SCRIPT_DIR = __dirname || path.resolve();
const POSTS_DIR = path.join(SCRIPT_DIR, "..", "content", "posts");

// Função para formatar data como YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Função para gerar a próxima data
const getNextDate = (startDate: Date, index: number): Date => {
  const nextDate = new Date(startDate);
  nextDate.setDate(startDate.getDate() + index);
  return nextDate;
};

// Função para extrair título do nome do arquivo
const extractTitleFromFilename = (filename: string): string => {
  // Remover a extensão .json
  const withoutExtension = filename.replace(".json", "");

  // Se já começar com data, remover a parte da data
  if (/^\d{4}-\d{2}-\d{2}/.test(filename)) {
    // Padrão: YYYY-MM-DD-titulo-do-post.json
    return withoutExtension.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  }

  return withoutExtension;
};

// Função principal para renomear os arquivos e atualizar datas
const updatePostDates = (): void => {
  console.log("Iniciando atualização de datas dos posts...");

  try {
    // Ler todos os arquivos da pasta de posts
    const files = fs.readdirSync(POSTS_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    // Ordenamos os arquivos para garantir uma sequência consistente
    const sortedFiles = jsonFiles.sort();

    // Data inicial: 17 de abril de 2025
    const startDate = new Date(2025, 3, 17); // Mês é baseado em zero (0-11)

    console.log(`Data inicial: ${formatDate(startDate)}`);
    console.log(`Total de arquivos a processar: ${sortedFiles.length}`);

    let updatedCount = 0;

    // Processar cada arquivo com uma nova data sequencial
    sortedFiles.forEach((file, index) => {
      const filePath = path.join(POSTS_DIR, file);

      try {
        // Gerar a data para este arquivo
        const postDate = getNextDate(startDate, index);
        const formattedDate = formatDate(postDate);

        // Ler o conteúdo do arquivo
        const fileContent = fs.readFileSync(filePath, "utf8");
        const post = JSON.parse(fileContent);

        // Atualizar a data de publicação no objeto JSON
        const originalDate = post.publish_date;
        post.publish_date = formattedDate;

        // Extrair o título do nome do arquivo atual
        const titlePart = extractTitleFromFilename(file);

        // Criar o novo nome de arquivo
        const newFilename = `${formattedDate}-${titlePart}.json`;
        const newFilePath = path.join(POSTS_DIR, newFilename);

        // Escrever o JSON atualizado de volta para o arquivo
        fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf8");

        // Renomear o arquivo se o nome mudou
        if (file !== newFilename) {
          fs.renameSync(filePath, newFilePath);
          console.log(
            `Arquivo atualizado: ${file} -> ${newFilename} (Data: ${originalDate} -> ${formattedDate})`
          );
        } else {
          console.log(
            `Arquivo atualizado: ${file} (apenas data interna: ${originalDate} -> ${formattedDate})`
          );
        }

        updatedCount++;
      } catch (error) {
        console.error(
          `Erro ao processar arquivo ${file}:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    });

    console.log(
      `Processo concluído. ${updatedCount} arquivos foram atualizados.`
    );
  } catch (error) {
    console.error(
      "Erro ao atualizar arquivos:",
      error instanceof Error ? error.message : String(error)
    );
  }
};

// Executar se for chamado diretamente
if (require.main === module) {
  updatePostDates();
}

export default updatePostDates;
