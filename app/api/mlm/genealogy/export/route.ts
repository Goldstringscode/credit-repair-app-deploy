import { type NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { requireAuth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const format = searchParams.get("format") as 'csv' | 'excel' | 'pdf'
      const targetUserId = searchParams.get("userId") || user.id

      if (!format || !['csv', 'excel', 'pdf'].includes(format)) {
        return NextResponse.json({ 
          success: false,
          error: "Valid format is required (csv, excel, pdf)" 
        }, { status: 400 })
      }

      // Get team data for export
      const teamData = await mlmDatabaseService.getTeamStructure(targetUserId, 10)
      const targetUser = await mlmDatabaseService.getMLMUser(targetUserId)

      if (!targetUser) {
        return NextResponse.json({ 
          success: false,
          error: "User not found" 
        }, { status: 404 })
      }

      // Generate export data based on format
      let exportData: any
      let contentType: string
      let filename: string

      switch (format) {
        case 'csv':
          exportData = generateCSV(teamData, user)
          contentType = 'text/csv'
          filename = `team-genealogy-${Date.now()}.csv`
          break
        case 'excel':
          exportData = generateExcel(teamData, user)
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          filename = `team-genealogy-${Date.now()}.xlsx`
          break
        case 'pdf':
          exportData = generatePDF(teamData, user)
          contentType = 'application/pdf'
          filename = `team-genealogy-${Date.now()}.pdf`
          break
        default:
          throw new Error('Unsupported format')
      }

      return new NextResponse(exportData, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } catch (error) {
      console.error("Export error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to export team data" 
      }, { status: 500 })
    }
  }),
  'general'
)

// Helper functions for different export formats
function generateCSV(teamData: any[], user: any): string {
  const headers = [
    'Name',
    'Email',
    'Rank',
    'Status',
    'Level',
    'Personal Volume',
    'Team Volume',
    'Monthly Earnings',
    'Join Date',
    'Sponsor'
  ]

  const rows = [headers.join(',')]

  const flattenTeam = (members: any[], level = 1, sponsor = 'You') => {
    members.forEach(member => {
      const row = [
        `"${member.name || 'Unknown'}"`,
        `"${member.email || ''}"`,
        `"${member.rank || 'Associate'}"`,
        `"${member.status || 'active'}"`,
        level,
        member.volume || 0,
        member.teamVolume || 0,
        member.earnings || 0,
        `"${member.joinDate || new Date().toISOString()}"`,
        `"${sponsor}"`
      ]
      rows.push(row.join(','))
      
      if (member.children && member.children.length > 0) {
        flattenTeam(member.children, level + 1, member.name)
      }
    })
  }

  flattenTeam(teamData)

  return rows.join('\n')
}

function generateExcel(teamData: any[], user: any): Buffer {
  // In a real implementation, this would use a library like 'xlsx'
  // For now, return a simple CSV as Excel
  const csvData = generateCSV(teamData, user)
  return Buffer.from(csvData, 'utf-8')
}

function generatePDF(teamData: any[], user: any): Buffer {
  // In a real implementation, this would use a library like 'puppeteer' or 'jsPDF'
  // For now, return a simple text representation
  const textData = `Team Genealogy Report\n\n` +
    `Generated: ${new Date().toLocaleString()}\n` +
    `Team Leader: ${user.firstName} ${user.lastName}\n\n` +
    `Total Members: ${teamData.length}\n\n` +
    `This is a placeholder for PDF generation. In a real implementation, ` +
    `this would generate a properly formatted PDF with team structure, ` +
    `member details, and statistics.`

  return Buffer.from(textData, 'utf-8')
}
