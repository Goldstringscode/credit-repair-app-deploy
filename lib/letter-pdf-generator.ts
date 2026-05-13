/**
 * lib/letter-pdf-generator.ts
 * Converts dispute letter text to PDF for certified mail via Shippo.
 * Uses pdfkit to generate a properly formatted, printable letter.
 */

import PDFDocument from 'pdfkit'

export interface LetterPDFOptions {
  letterContent: string
  senderName: string
  senderAddress?: string
  senderCity?: string
  senderState?: string
  senderZip?: string
}

/**
 * Generates a PDF buffer from letter text content.
 * Returns a Buffer containing the PDF binary.
 */
export async function generateLetterPDF(opts: LetterPDFOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',           // 8.5 x 11 inches — standard US mail
        margins: {
          top: 72,                // 1 inch margins (72 points = 1 inch)
          bottom: 72,
          left: 72,
          right: 72,
        },
        info: {
          Title: 'Credit Dispute Letter',
          Author: opts.senderName,
          Creator: 'Credit Repair AI',
        },
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Font settings
      const FONT_REGULAR = 'Helvetica'
      const FONT_BOLD = 'Helvetica-Bold'
      const FONT_SIZE = 11
      const LINE_GAP = 4

      // Split content into lines and render
      const lines = opts.letterContent
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')

      doc.font(FONT_REGULAR).fontSize(FONT_SIZE)

      let isFirstLine = true
      for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed) {
          // Blank line = paragraph break
          doc.moveDown(0.5)
          continue
        }

        // Detect and bold headers / key lines
        const isBold =
          trimmed.startsWith('Re:') ||
          trimmed.startsWith('To Whom') ||
          trimmed.startsWith('Dear ') ||
          trimmed.startsWith('Sincerely') ||
          trimmed.startsWith('CERTIFIED MAIL') ||
          /^[A-Z][A-Z\s]{4,}:/.test(trimmed)  // ALL CAPS labels like "SUBJECT:"

        doc
          .font(isBold ? FONT_BOLD : FONT_REGULAR)
          .fontSize(FONT_SIZE)
          .text(trimmed, {
            align: 'left',
            lineGap: LINE_GAP,
          })

        isFirstLine = false
      }

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Converts a PDF Buffer to a base64 string for Shippo API.
 */
export function pdfToBase64(pdfBuffer: Buffer): string {
  return pdfBuffer.toString('base64')
}

/**
 * Full pipeline: letter text → PDF Buffer → base64 string
 */
export async function letterTextToBase64PDF(opts: LetterPDFOptions): Promise<string> {
  const pdfBuffer = await generateLetterPDF(opts)
  return pdfToBase64(pdfBuffer)
}
