import * as nodeCron from "node-cron";
import { exec } from "child_process";
import * as path from "path";
import * as fs from "fs";

// Configuração de caminhos
const SCRIPT_DIR = __dirname || path.resolve();
const LOG_DIR = path.join(SCRIPT_DIR, "..", "..", "logs");

// Garantir que a pasta de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Função para registrar mensagens de log
const logMessage = (message: string): void => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  console.log(message);
  fs.appendFileSync(path.join(LOG_DIR, "cron-scheduler-logs.log"), logMessage);
};

logMessage("Iniciando o agendador de publicação de posts...");

// Agenda a tarefa para executar todos os dias às 8:00 da manhã
nodeCron.schedule("0 8 * * *", () => {
  logMessage(`Executando publicação agendada em ${new Date().toISOString()}`);

  // Caminho para o script de publicação
  const scriptPath = path.join(SCRIPT_DIR, "publish-scheduled-posts.ts");

  // Comando para executar o script TypeScript
  const command = `npx ts-node ${scriptPath}`;

  // Executa o comando
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logMessage(`Erro ao executar o script: ${error.message}`);
      return;
    }

    if (stderr) {
      logMessage(`Erro no script: ${stderr}`);
      return;
    }

    logMessage(`Saída do script:\n${stdout}`);
    logMessage("Publicação diária concluída com sucesso");
  });
});

// Verificar se deve executar imediatamente
if (process.argv.includes("--run-now")) {
  logMessage(
    "Executando publicação imediatamente por solicitação da linha de comando"
  );

  // Caminho para o script de publicação
  const scriptPath = path.join(SCRIPT_DIR, "publish-scheduled-posts.ts");

  // Comando para executar o script TypeScript
  const command = `npx ts-node ${scriptPath}`;

  // Executa o comando
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logMessage(`Erro ao executar o script: ${error.message}`);
      return;
    }

    if (stderr && stderr.trim() !== "") {
      logMessage(`Erro no script: ${stderr}`);
      return;
    }

    logMessage(`Saída do script:\n${stdout}`);
    logMessage("Execução manual concluída com sucesso");
  });
}

logMessage(
  "Agendador iniciado. Posts serão publicados automaticamente às 8:00 da manhã todos os dias."
);
logMessage("Use 'npm run publish-post' para executar manualmente.");
