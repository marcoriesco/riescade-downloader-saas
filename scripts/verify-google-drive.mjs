import dotenv from "dotenv";
import { GoogleAuth } from "google-auth-library";

dotenv.config({ path: ".env.local" });

const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const driveId = process.env.GOOGLE_SHARED_DRIVE_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

if (!driveId || !email || !privateKey) {
  throw new Error("Google Drive environment variables are incomplete");
}

const auth = new GoogleAuth({
  credentials: {
    client_email: email,
    private_key: privateKey,
  },
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const client = await auth.getClient();

async function listFolders(parentId) {
  const response = await client.request({
    url: "https://www.googleapis.com/drive/v3/files",
    params: {
      q: `'${parentId}' in parents and trashed = false`,
      fields: "files(id,name,mimeType)",
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: "drive",
      driveId,
    },
  });

  return (response.data.files ?? []).filter(
    (file) => file.mimeType === FOLDER_MIME_TYPE
  );
}

const rootFolders = await listFolders(driveId);
console.log(`root_folders=${rootFolders.map((folder) => folder.name).join(",")}`);

for (const expectedName of ["bios", "roms"]) {
  const folder = rootFolders.find(
    (item) => item.name.toLocaleLowerCase() === expectedName
  );
  console.log(`${expectedName}_found=${Boolean(folder)}`);

  if (expectedName === "roms" && folder) {
    const platforms = await listFolders(folder.id);
    console.log(
      `rom_platforms=${platforms.map((item) => item.name).join(",")}`
    );
  }
}
