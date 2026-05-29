/**
 * lib/letter-pdf-generator.ts
 * Generates PDF from letter text using raw PDF spec - no font file dependencies.
 * Works in Vercel serverless (no PDFKit font files required).
 */

export interface LetterPDFOptions {
  letterContent: string
  senderName?: string
  senderAddress?: string
  senderCity?: string
  senderState?: string
  senderZip?: string
}

/**
 * Generates a simple PDF from letter text using raw PDF syntax.
 * Uses only PDF built-in fonts (Helvetica) - no external font files needed.
 */
export function generateLetterPDFSync(opts: LetterPDFOptions): Buffer {
  const lines = opts.letterContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')

  // PDF page dimensions (US Letter: 612 x 792 points)
  const pageW = 612
  const pageH = 792
  const margin = 72          // 1 inch margins
  const fontSize = 11
  const lineHeight = fontSize * 1.4
  const maxWidth = pageW - margin * 2
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55)) // approx chars per line

  // Word-wrap lines
  const wrappedLines: string[] = []
  for (const line of lines) {
    if (line.trim() === '') { wrappedLines.push(''); continue }
    // Simple word wrap
    const words = line.split(' ')
    let currentLine = ''
    for (const word of words) {
      const test = currentLine ? currentLine + ' ' + word : word
      if (test.length <= charsPerLine) {
        currentLine = test
      } else {
        if (currentLine) wrappedLines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) wrappedLines.push(currentLine)
  }

  // Build PDF content stream
  const escape = (s: string) => s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ') // strip non-ASCII

  let y = pageH - margin
  const streamLines: string[] = []
  streamLines.push('BT')
  streamLines.push('/F1 ' + fontSize + ' Tf')
  streamLines.push(margin + ' ' + y + ' Td')
  streamLines.push(lineHeight + ' TL')

  for (const line of wrappedLines) {
    if (line === '') {
      streamLines.push('T*') // blank line
    } else {
      streamLines.push('(' + escape(line) + ') Tj T*')
    }
    y -= lineHeight
    if (y < margin + lineHeight) {
      // Simple overflow protection - just stop (letters fit on 1-2 pages typically)
      break
    }
  }
  streamLines.push('ET')

  const stream = streamLines.join('\n')
  const streamBytes = Buffer.from(stream, 'latin1')

  // Build PDF structure
  const objects: string[] = []

  // Object 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')

  // Object 2: Pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj')

  // Object 3: Font (Helvetica - built-in, no font file needed)
  objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj')

  // Object 4: Page
  objects.push(
    '4 0 obj\n<< /Type /Page /Parent 2 0 R' +
    ' /MediaBox [0 0 ' + pageW + ' ' + pageH + ']' +
    ' /Contents 5 0 R' +
    ' /Resources << /Font << /F1 3 0 R >> >> >>\nendobj'
  )

  // Object 5: Content stream
  objects.push(
    '5 0 obj\n<< /Length ' + streamBytes.length + ' >>\nstream\n' +
    stream + '\nendstream\nendobj'
  )

  // Build the full PDF
  const header = '%PDF-1.4\n'
  const parts: Buffer[] = [Buffer.from(header, 'latin1')]

  // Track byte offsets for xref table
  const offsets: number[] = []
  let offset = header.length

  for (const obj of objects) {
    offsets.push(offset)
    const buf = Buffer.from(obj + '\n', 'latin1')
    parts.push(buf)
    offset += buf.length
  }

  // xref table
  const xrefOffset = offset
  const xref = ['xref', '0 ' + (objects.length + 1), '0000000000 65535 f ']
  for (const o of offsets) {
    xref.push(o.toString().padStart(10, '0') + ' 00000 n ')
  }
  xref.push('')
  const xrefBuf = Buffer.from(xref.join('\n'), 'latin1')
  parts.push(xrefBuf)

  // trailer
  const trailer =
    'trailer\n<< /Size ' + (objects.length + 1) +
    ' /Root 1 0 R >>\n' +
    'startxref\n' + xrefOffset + '\n%%EOF\n'
  parts.push(Buffer.from(trailer, 'latin1'))

  return Buffer.concat(parts)
}

export async function generateLetterPDF(opts: LetterPDFOptions): Promise<Buffer> {
  return generateLetterPDFSync(opts)
}

export function pdfToBase64(pdfBuffer: Buffer): string {
  return pdfBuffer.toString('base64')
}

export async function letterTextToBase64PDF(opts: LetterPDFOptions): Promise<string> {
  const buf = generateLetterPDFSync(opts)
  return pdfToBase64(buf)
}
