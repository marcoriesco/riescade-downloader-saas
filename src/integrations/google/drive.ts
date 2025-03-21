import { google } from "googleapis";

// Definir os escopos necessários
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// Inicializar a autenticação do Google
const initAuth = () => {
  try {
    // Verificar se as variáveis de ambiente necessárias estão definidas
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error("GOOGLE_CLIENT_EMAIL não está definido");
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("GOOGLE_PRIVATE_KEY não está definido");
    }
    if (!process.env.GOOGLE_PROJECT_ID) {
      throw new Error("GOOGLE_PROJECT_ID não está definido");
    }

    // Log para debug
    console.log("Iniciando autenticação Google com:", {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_length: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: SCOPES,
    });

    console.log("Autenticação Google inicializada com sucesso");
    return auth;
  } catch (error) {
    console.error("Erro ao inicializar autenticação Google:", error);
    throw error;
  }
};

/**
 * Adiciona permissão para um usuário em um arquivo/pasta específico no Google Drive
 *
 * @param email Email do usuário que receberá acesso
 * @param folderId ID da pasta ou arquivo no Google Drive
 * @param role Nível de permissão ('reader', 'commenter', ou 'writer')
 * @returns Resultado da operação
 */
export const addUserPermission = async (
  email: string,
  folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  role: "reader" | "commenter" | "writer" = "reader"
) => {
  try {
    // Verificar se temos os parâmetros necessários
    if (!email || !folderId) {
      throw new Error("Email ou ID da pasta não fornecidos");
    }

    const auth = initAuth();
    const drive = google.drive({ version: "v3", auth });

    console.log(
      `Adicionando permissão para ${email} na pasta ${folderId} com nível ${role}`
    );

    // Criar permissão
    const permission = {
      type: "user",
      role: role,
      emailAddress: email,
      sendNotificationEmail: false,
    };

    // Adicionar permissão
    const response = await drive.permissions.create({
      fileId: folderId,
      requestBody: permission,
      fields: "id",
      supportsAllDrives: true,
    });

    console.log(
      `Permissão adicionada com sucesso para ${email}, ID: ${response.data.id}`
    );
    return { success: true, permissionId: response.data.id };
  } catch (error) {
    console.error(`Erro ao adicionar permissão para ${email}:`, error);
    return { success: false, error };
  }
};

/**
 * Remove a permissão de um usuário em um arquivo/pasta específico do Google Drive
 *
 * @param email Email do usuário para remover acesso
 * @param folderId ID da pasta ou arquivo no Google Drive
 * @returns Resultado da operação
 */
export const removeUserPermission = async (
  email: string,
  folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || ""
) => {
  try {
    // Verificar se temos os parâmetros necessários
    if (!email || !folderId) {
      throw new Error("Email ou ID da pasta não fornecidos");
    }

    const auth = initAuth();
    const drive = google.drive({ version: "v3", auth });

    console.log(
      `Buscando permissão para remover: ${email} da pasta ${folderId}`
    );

    // Primeiro encontrar o ID da permissão do usuário
    const permissionList = await drive.permissions.list({
      fileId: folderId,
      fields: "permissions(id, emailAddress)",
      supportsAllDrives: true,
    });

    // Encontrar a permissão pelo email
    const permission = permissionList.data.permissions?.find(
      (p) => p.emailAddress === email
    );

    if (!permission || !permission.id) {
      console.log(`Permissão não encontrada para o email ${email}`);
      return { success: false, message: "Permissão não encontrada" };
    }

    // Remover a permissão
    await drive.permissions.delete({
      fileId: folderId,
      permissionId: permission.id,
      supportsAllDrives: true,
    });

    console.log(`Permissão removida com sucesso para ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Erro ao remover permissão para ${email}:`, error);
    return { success: false, error };
  }
};

/**
 * Verifica se um usuário já tem permissão em um arquivo/pasta
 *
 * @param email Email do usuário para verificar
 * @param folderId ID da pasta ou arquivo no Google Drive
 * @returns true se o usuário já tem permissão, false caso contrário
 */
export const hasUserPermission = async (
  email: string,
  folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || ""
) => {
  try {
    // Verificar se temos os parâmetros necessários
    if (!email || !folderId) {
      throw new Error("Email ou ID da pasta não fornecidos");
    }

    const auth = initAuth();
    const drive = google.drive({ version: "v3", auth });

    // Listar permissões
    const permissionList = await drive.permissions.list({
      fileId: folderId,
      fields: "permissions(id, emailAddress)",
      supportsAllDrives: true,
    });

    // Verificar se o email já tem permissão
    const hasPermission = permissionList.data.permissions?.some(
      (p) => p.emailAddress === email
    );

    return !!hasPermission;
  } catch (error) {
    console.error(`Erro ao verificar permissão para ${email}:`, error);
    return false;
  }
};
