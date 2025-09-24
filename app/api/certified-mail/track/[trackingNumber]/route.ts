import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { shipEngineService } from '@/lib/shipengine-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const { trackingNumber } = params;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Get mail record from database
    const { data: mailRecord, error: dbError } = await supabase
      .from('certified_mail_tracking')
      .select(`
        *,
        mail_events (
          id,
          event_type,
          description,
          location,
          timestamp,
          created_at
        )
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (dbError || !mailRecord) {
      return NextResponse.json(
        { error: 'Mail record not found' },
        { status: 404 }
      );
    }

    // If we have ShipEngine integration, get real-time tracking
    let realTimeTracking = null;
    if (mailRecord.shipengine_tracking_id) {
      try {
        console.log('Fetching real-time tracking from ShipEngine...');
        const trackingInfo = await shipEngineService.getTrackingInfo(mailRecord.shipengine_tracking_id);

        realTimeTracking = {
          status: trackingInfo.status,
          events: trackingInfo.events?.map(event => ({
            event: event.event,
            timestamp: event.timestamp,
            location: event.location || 'Unknown',
            details: event.details || event.event
          })) || [],
          estimatedDelivery: trackingInfo.estimatedDelivery,
          carrier: 'USPS',
          service: 'certified_mail'
        };

        // Update database with latest status if it's different
        if (trackingInfo.status !== mailRecord.status) {
          await supabase
            .from('certified_mail_tracking')
            .update({
              status: mapTrackingStatus(trackingInfo.status),
              processing_status: trackingInfo.status,
              updated_at: new Date().toISOString()
            })
            .eq('tracking_number', trackingNumber);

          // Add new events to database
          if (trackingInfo.events) {
            const newEvents = trackingInfo.events.filter(event => {
              // Check if this event already exists in our database
              return !mailRecord.mail_events.some((dbEvent: any) => 
                dbEvent.event_type === event.event && 
                new Date(dbEvent.timestamp).getTime() === new Date(event.timestamp).getTime()
              );
            });

            for (const event of newEvents) {
              await supabase
                .from('mail_events')
                .insert({
                  tracking_id: mailRecord.id,
                  event_type: event.event,
                  description: event.details || event.event,
                  location: event.location || 'Unknown',
                  timestamp: event.timestamp
                });
            }
          }
        }
      } catch (shipengineError) {
        console.error('ShipEngine tracking error:', shipengineError);
        // Continue with database data if ShipEngine fails
      }
    }

    // Format the response
    const response = {
      trackingNumber: mailRecord.tracking_number,
      status: mailRecord.status,
      processingStatus: mailRecord.processing_status,
      recipient: {
        name: mailRecord.recipient_name,
        address: JSON.parse(mailRecord.recipient_address)
      },
      sender: {
        name: mailRecord.sender_name,
        address: JSON.parse(mailRecord.sender_address)
      },
      letter: {
        subject: mailRecord.letter_subject,
        type: mailRecord.letter_type
      },
      service: {
        tier: mailRecord.mail_service,
        cost: mailRecord.cost
      },
      timeline: {
        sent: mailRecord.sent_date,
        estimatedDelivery: mailRecord.estimated_delivery,
        actualDelivery: mailRecord.delivered_date
      },
      events: mailRecord.mail_events
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((event: any) => ({
          event: event.event_type,
          description: event.description,
          location: event.location,
          timestamp: event.timestamp,
          source: 'database'
        })),
      realTimeTracking,
      lastUpdated: mailRecord.updated_at
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching tracking info:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch tracking information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function mapTrackingStatus(shipengineStatus: string): string {
  const statusMap: Record<string, string> = {
    'in_transit': 'in_transit',
    'delivered': 'delivered',
    'exception': 'failed',
    'return_to_sender': 'returned',
    'pending': 'processing',
    'picked_up': 'in_transit',
    'out_for_delivery': 'in_transit'
  };
  
  return statusMap[shipengineStatus] || 'processing';
}
