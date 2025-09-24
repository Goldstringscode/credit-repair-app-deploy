declare module 'pdf-parse' {
  interface PDFData {
    text: string
    numpages: number
    info: any
    metadata: any
    version: string
  }

  interface PDFParseOptions {
    normalizeWhitespace?: boolean
    disableCombineTextItems?: boolean
  }

  function pdfParse(buffer: Buffer | ArrayBuffer, options?: PDFParseOptions): Promise<PDFData>
  
  export = pdfParse
}
