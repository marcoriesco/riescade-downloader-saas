export const EXTRACT_PACKAGE_SUFFIX = ".extract.zip";

export function isExtractPackage(filename: string): boolean {
  return filename.toLocaleLowerCase("pt-BR").endsWith(EXTRACT_PACKAGE_SUFFIX);
}

export function downloadPackageTitle(filename: string): string {
  if (isExtractPackage(filename)) {
    return filename.slice(0, -EXTRACT_PACKAGE_SUFFIX.length);
  }
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}
