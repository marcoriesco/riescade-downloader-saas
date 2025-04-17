import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { parseStringPromise } from "xml2js";

export async function GET(request: NextRequest) {
  // Obter o parâmetro de consulta 'platform'
  const platform = request.nextUrl.searchParams.get("platform");

  if (!platform) {
    return NextResponse.json(
      { exists: false, error: "Parâmetro platform não especificado" },
      { status: 400 }
    );
  }

  try {
    // Caminho para o arquivo XML
    const xmlFilePath = path.join(
      process.cwd(),
      "src/data/platforms",
      `${platform}.xml`
    );

    console.log(`Checking for XML file: ${xmlFilePath}`);

    // Verificar se o arquivo existe
    if (!fs.existsSync(xmlFilePath)) {
      console.log(`XML file for ${platform} not found: ${xmlFilePath}`);
      return NextResponse.json({ exists: false });
    }

    console.log(`XML file found for ${platform}, parsing content...`);

    // Ler e converter o XML
    const xmlContent = fs.readFileSync(xmlFilePath, "utf-8");
    const result = await parseStringPromise(xmlContent);

    // Extrair os dados da plataforma
    if (result?.theme?.variables?.[0]) {
      const variables = result.theme.variables[0];

      const metadata = {
        systemName: variables.systemName?.[0] || "",
        systemDescription: variables.systemDescription?.[0] || "",
        systemManufacturer: variables.systemManufacturer?.[0] || "",
        systemReleaseYear: variables.systemReleaseYear?.[0] || "",
        systemReleaseDate: variables.systemReleaseDate?.[0] || "",
        systemReleaseDateFormated:
          variables.systemReleaseDateFormated?.[0] || "",
        systemHardwareType: variables.systemHardwareType?.[0] || "",
        systemColor: variables.systemColor?.[0] || "ff0884",
        systemColorPalette1: variables.systemColorPalette1?.[0] || "8a0046",
        systemColorPalette2: variables.systemColorPalette2?.[0] || "560029",
        systemColorPalette3: variables.systemColorPalette3?.[0] || "23001b",
        systemColorPalette4: variables.systemColorPalette4?.[0] || "110011",
      };

      console.log(`Successfully extracted metadata for ${platform}`);
      return NextResponse.json({ exists: true, metadata });
    }

    console.log(`Invalid metadata format for ${platform}`);
    return NextResponse.json(
      { exists: true, error: "Formato de metadados inválido" },
      { status: 400 }
    );
  } catch (error) {
    console.error(`Erro ao verificar arquivo XML para ${platform}:`, error);
    return NextResponse.json(
      { exists: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
