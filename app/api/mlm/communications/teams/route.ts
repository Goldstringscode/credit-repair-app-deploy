import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, this would come from Supabase
const mockTeams = [
  {
    id: '1',
    name: 'Alpha Warriors',
    description: 'Top performing team with excellent leadership',
    members: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        rank: 'Diamond',
        status: 'online',
        role: 'leader',
        joinDate: new Date('2024-01-01'),
        personalVolume: 15000,
        teamVolume: 50000,
        commission: 2500,
        isActive: true,
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        rank: 'Platinum',
        status: 'away',
        role: 'member',
        joinDate: new Date('2024-01-15'),
        personalVolume: 8000,
        teamVolume: 25000,
        commission: 1200,
        isActive: true,
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        rank: 'Gold',
        status: 'busy',
        role: 'member',
        joinDate: new Date('2024-02-01'),
        personalVolume: 5000,
        teamVolume: 15000,
        commission: 750,
        isActive: true,
      },
    ],
    hierarchy: {
      level: 1,
      parent: null,
      children: ['2', '3'],
    },
    channels: [
      {
        id: '1',
        name: 'general',
        type: 'team',
        description: 'General team discussions',
        memberCount: 3,
        unreadCount: 3,
        lastActivity: new Date(Date.now() - 300000),
      },
      {
        id: '2',
        name: 'announcements',
        type: 'announcement',
        description: 'Important team announcements',
        memberCount: 3,
        unreadCount: 1,
        lastActivity: new Date(Date.now() - 600000),
      },
      {
        id: '3',
        name: 'training',
        type: 'training',
        description: 'Training materials and discussions',
        memberCount: 3,
        unreadCount: 0,
        lastActivity: new Date(Date.now() - 900000),
      },
    ],
    stats: {
      totalMembers: 3,
      activeMembers: 3,
      totalVolume: 50000,
      totalCommission: 4450,
      averageRank: 'Platinum',
      growthRate: 15.5,
      retentionRate: 95.2,
    },
    created_at: new Date('2024-01-01'),
    updated_at: new Date(),
  },
  {
    id: '2',
    name: 'Beta Builders',
    description: 'Growing team focused on development',
    members: [
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        rank: 'Silver',
        status: 'online',
        role: 'leader',
        joinDate: new Date('2024-01-10'),
        personalVolume: 3000,
        teamVolume: 12000,
        commission: 450,
        isActive: true,
      },
      {
        id: '5',
        name: 'David Brown',
        email: 'david@example.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
        rank: 'Bronze',
        status: 'offline',
        role: 'member',
        joinDate: new Date('2024-02-15'),
        personalVolume: 1500,
        teamVolume: 5000,
        commission: 150,
        isActive: true,
      },
    ],
    hierarchy: {
      level: 2,
      parent: '1',
      children: [],
    },
    channels: [
      {
        id: '4',
        name: 'general',
        type: 'team',
        description: 'General team discussions',
        memberCount: 2,
        unreadCount: 0,
        lastActivity: new Date(Date.now() - 1200000),
      },
    ],
    stats: {
      totalMembers: 2,
      activeMembers: 1,
      totalVolume: 12000,
      totalCommission: 600,
      averageRank: 'Bronze',
      growthRate: 8.2,
      retentionRate: 88.5,
    },
    created_at: new Date('2024-01-10'),
    updated_at: new Date(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');
    const includeHierarchy = searchParams.get('includeHierarchy') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (teamId) {
      // Get specific team
      const team = mockTeams.find(t => t.id === teamId);
      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      // Check if user is member of team
      const isMember = team.members.some(m => m.id === userId);
      if (!isMember) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      let responseData = { ...team };
      
      if (!includeHierarchy) {
        delete responseData.hierarchy;
      }
      
      if (!includeStats) {
        delete responseData.stats;
      }

      return NextResponse.json({
        success: true,
        data: responseData,
      });
    } else {
      // Get all teams for user
      const userTeams = mockTeams.filter(team =>
        team.members.some(member => member.id === userId)
      );

      let responseData = userTeams.map(team => {
        let teamData = { ...team };
        
        if (!includeHierarchy) {
          delete teamData.hierarchy;
        }
        
        if (!includeStats) {
          delete teamData.stats;
        }
        
        return teamData;
      });

      return NextResponse.json({
        success: true,
        data: responseData,
        count: responseData.length,
      });
    }

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
    const { name, description, leaderId, parentTeamId } = body;

    if (!name || !leaderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you would create the team in Supabase here
    // const { data, error } = await supabase
    //   .from('mlm_teams')
    //   .insert({
    //     name,
    //     description,
    //     leader_id: leaderId,
    //     parent_team_id: parentTeamId,
    //   })
    //   .select()
    //   .single();

    const newTeam = {
      id: Date.now().toString(),
      name,
      description,
      members: [
        {
          id: leaderId,
          name: 'Team Leader',
          email: 'leader@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          rank: 'Gold',
          status: 'online',
          role: 'leader',
          joinDate: new Date(),
          personalVolume: 0,
          teamVolume: 0,
          commission: 0,
          isActive: true,
        },
      ],
      hierarchy: {
        level: parentTeamId ? 2 : 1,
        parent: parentTeamId,
        children: [],
      },
      channels: [],
      stats: {
        totalMembers: 1,
        activeMembers: 1,
        totalVolume: 0,
        totalCommission: 0,
        averageRank: 'Gold',
        growthRate: 0,
        retentionRate: 100,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add to mock data
    mockTeams.push(newTeam);

    return NextResponse.json({
      success: true,
      data: newTeam,
    });

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

    // In production, you would update the team in Supabase here
    // const { data, error } = await supabase
    //   .from('mlm_teams')
    //   .update(updates)
    //   .eq('id', teamId)
    //   .select()
    //   .single();

    const teamIndex = mockTeams.findIndex(t => t.id === teamId);
    if (teamIndex > -1) {
      mockTeams[teamIndex] = {
        ...mockTeams[teamIndex],
        ...updates,
        updated_at: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      data: mockTeams[teamIndex],
    });

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

    // In production, you would delete the team in Supabase here
    // const { error } = await supabase
    //   .from('mlm_teams')
    //   .delete()
    //   .eq('id', teamId);

    const teamIndex = mockTeams.findIndex(t => t.id === teamId);
    if (teamIndex > -1) {
      mockTeams.splice(teamIndex, 1);
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
