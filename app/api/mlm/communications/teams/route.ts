import { NextRequest, NextResponse } from 'next/server';
import { mlmDatabaseService } from '@/lib/mlm/database-service';
import { communicationDatabaseService } from '@/lib/database/communication-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');
    const includeStats = searchParams.get('includeStats') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the team structure (downline) from MLM genealogy
    const downline = await mlmDatabaseService.getTeamStructure(userId);

    if (teamId) {
      // Find the specific sub-team rooted at the requested member
      const leader = downline.find((m) => m.userId === teamId);
      if (!leader) {
        return NextResponse.json({ error: 'Team not found or access denied' }, { status: 404 });
      }

      const members = downline.filter((m) => m.uplineId === teamId || m.userId === teamId);
      const channels = await communicationDatabaseService.getUserChannels(userId);

      const team = buildTeam(teamId, leader.displayName ?? teamId, members, channels, includeStats);

      return NextResponse.json({ success: true, data: team });
    }

    // Build a single team view: the caller is the leader of their direct downline
    const directReports = downline.filter((m) => m.level === 1);
    const channels = await communicationDatabaseService.getUserChannels(userId);
    const team = buildTeam(userId, 'My Team', downline, channels, includeStats);

    // Also return each direct report as a sub-team
    const subTeams = directReports.map((dr) => {
      const subMembers = downline.filter((m) => m.uplineId === dr.userId || m.userId === dr.userId);
      return buildTeam(dr.userId, dr.displayName ?? dr.userId, subMembers, [], false);
    });

    return NextResponse.json({
      success: true,
      data: [team, ...subTeams],
      count: 1 + subTeams.length,
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, leaderId } = body;

    if (!name || !leaderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Teams are derived from the genealogy structure — there is no separate teams table.
    // Return the leader's current team structure.
    const downline = await mlmDatabaseService.getTeamStructure(leaderId);
    const channels = await communicationDatabaseService.getUserChannels(leaderId);
    const team = buildTeam(leaderId, name, downline, channels, false);

    return NextResponse.json({ success: true, data: { ...team, description } });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, updates } = body;

    if (!teamId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Return the updated team view (teams are derived from genealogy, no DB write needed here)
    const downline = await mlmDatabaseService.getTeamStructure(teamId);
    const channels = await communicationDatabaseService.getUserChannels(teamId);
    const team = buildTeam(teamId, updates.name ?? 'My Team', downline, channels, false);

    return NextResponse.json({ success: true, data: { ...team, ...updates } });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildTeam(
  leaderId: string,
  leaderName: string,
  members: any[],
  channels: any[],
  includeStats: boolean,
) {
  const memberList = members.map((m) => ({
    id: m.userId,
    name: m.displayName ?? m.userId,
    email: m.email ?? '',
    rank: m.rank ?? 'associate',
    status: m.isActive ? 'active' : 'inactive',
    role: m.userId === leaderId ? 'leader' : 'member',
    joinDate: m.joinDate,
    isActive: m.isActive ?? true,
  }));

  const team: any = {
    id: leaderId,
    name: leaderName,
    members: memberList,
    channels: channels.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      description: c.description,
      memberCount: memberList.length,
      unreadCount: 0,
      lastActivity: c.updated_at,
    })),
    created_at: memberList[0]?.joinDate ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (includeStats) {
    const activeCount = memberList.filter((m) => m.isActive).length;
    team.stats = {
      totalMembers: memberList.length,
      activeMembers: activeCount,
      totalVolume: 0,
      totalCommission: 0,
      averageRank: 'associate',
      growthRate: 0,
      retentionRate: memberList.length > 0 ? (activeCount / memberList.length) * 100 : 0,
    };
  }

  return team;
}
