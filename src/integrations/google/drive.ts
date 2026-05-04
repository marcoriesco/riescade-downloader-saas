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

    let pageToken: string | undefined = undefined;
    let permissionId: string | undefined = undefined;
    const targetEmail = email.toLowerCase().trim();

    do {
      const response = await drive.permissions.list({
        fileId: folderId,
        fields: "nextPageToken, permissions(id, emailAddress)",
        supportsAllDrives: true,
        pageSize: 100,
        pageToken: pageToken,
      });

      const permission = response.data.permissions?.find(
        (p) => p.emailAddress?.toLowerCase().trim() === targetEmail
      );

      if (permission && permission.id) {
        permissionId = permission.id;
        break;
      }

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    if (!permissionId) {
      console.log(`Permissão não encontrada para o email ${email}`);
      return { success: false, message: "Permissão não encontrada" };
    }

    // Remover a permissão
    await drive.permissions.delete({
      fileId: folderId,
      permissionId: permissionId,
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

    let pageToken: string | undefined = undefined;
    const targetEmail = email.toLowerCase().trim();

    do {
      const response = await drive.permissions.list({
        fileId: folderId,
        fields: "nextPageToken, permissions(id, emailAddress)",
        supportsAllDrives: true,
        pageSize: 100,
        pageToken: pageToken,
      });

      const hasPermission = response.data.permissions?.some(
        (p) => p.emailAddress?.toLowerCase().trim() === targetEmail
      );

      if (hasPermission) return true;

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    return false;
  } catch (error) {
    console.error(`Erro ao verificar permissão para ${email}:`, error);
    return false;
  }
};
