import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notificationService } from '@/lib/notification-service';
import crypto from 'crypto';

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`🔔 [${webhookId}] ShipEngine webhook received`);
    
    const body = await request.json();
    const eventType = body.event_type;
    const trackingNumber = body.tracking_number;
    
    console.log(`🔔 [${webhookId}] Event: ${eventType}, Tracking: ${trackingNumber}`);
    
    // Verify webhook signature (production security)
    const signature = request.headers.get('x-shipengine-signature');
    if (process.env.SHIPENGINE_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.SHIPENGINE_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error(`❌ [${webhookId}] Invalid webhook signature`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log(`✅ [${webhookId}] Webhook signature verified`);
    } else {
      console.warn(`⚠️ [${webhookId}] Webhook signature verification skipped (no secret configured)`);
    }

    // Handle different webhook event types
    let result;
    switch (eventType) {
      case 'label.created':
        result = await handleLabelCreated(body, webhookId);
        break;
      case 'tracking.status.updated':
        result = await handleTrackingUpdate(body, webhookId);
        break;
      case 'tracking.delivered':
        result = await handleDelivery(body, webhookId);
        break;
      case 'tracking.exception':
        result = await handleException(body, webhookId);
        break;
      case 'tracking.return_to_sender':
        result = await handleReturnToSender(body, webhookId);
        break;
      default:
        console.log(`ℹ️ [${webhookId}] Unhandled webhook event type: ${eventType}`);
        result = { success: true, message: 'Event type not handled' };
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ [${webhookId}] Webhook processed successfully in ${processingTime}ms`);
    
    return NextResponse.json({ 
      webhookId,
      processingTime: `${processingTime}ms`,
      ...result 
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${webhookId}] Webhook processing error after ${processingTime}ms:`, error);
    
    // Log error details for debugging
    console.error(`❌ [${webhookId}] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: await request.text().catch(() => 'Could not read body')
    });
    
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      webhookId,
      processingTime: `${processingTime}ms`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleLabelCreated(data: any, webhookId: string) {
  console.log(`📦 [${webhookId}] Label created:`, data);
  
  try {
    // Update the mail record with label information
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update({
        shipengine_label_id: data.label_id,
        shipengine_tracking_id: data.tracking_number,
        label_url: data.label_download_url,
        status: 'processing',
        // processing_status: 'label_created', // Column doesn't exist yet
        updated_at: new Date().toISOString()
      })
      .eq('tracking_number', data.tracking_number);

    if (error) {
      console.error(`❌ [${webhookId}] Error updating label info:`, error);
      throw error;
    }

    // Create mail event
    await createMailEvent(
      data.tracking_number,
      'label_created',
      'Shipping label created and ready for pickup',
      'shipengine',
      webhookId
    );

    console.log(`✅ [${webhookId}] Label created successfully for tracking: ${data.tracking_number}`);
    return { success: true, message: 'Label created successfully' };
  } catch (error) {
    console.error(`❌ [${webhookId}] Error handling label created:`, error);
    throw error;
  }
}

async function handleTrackingUpdate(data: any, webhookId: string) {
  console.log(`🚚 [${webhookId}] Tracking update:`, data);
  
  const trackingNumber = data.tracking_number;
  const status = data.status;
  const location = data.location;
  const description = data.description || getStatusDescription(status);

  try {
    // Update the mail record status
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update({
        status: mapTrackingStatus(status),
        // processing_status: status, // Column doesn't exist yet
        updated_at: new Date().toISOString()
      })
      .eq('tracking_number', trackingNumber);

    if (error) {
      console.error(`❌ [${webhookId}] Error updating tracking status:`, error);
      throw error;
    }

    // Create mail event
    await createMailEvent(
      trackingNumber,
      status,
      description,
      location?.city ? `${location.city}, ${location.state}` : 'shipengine',
      webhookId
    );

    // Send tracking notification
    await sendTrackingNotification(trackingNumber, status, location, webhookId);

    console.log(`✅ [${webhookId}] Tracking update processed for: ${trackingNumber}`);
    return { success: true, message: 'Tracking update processed' };
  } catch (error) {
    console.error(`❌ [${webhookId}] Error handling tracking update:`, error);
    throw error;
  }
}

async function handleDelivery(data: any, webhookId: string) {
  console.log(`🎉 [${webhookId}] Package delivered:`, data);
  
  const trackingNumber = data.tracking_number;
  const deliveredAt = data.delivered_at || new Date().toISOString();

  try {
    // Update the mail record
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update({
        status: 'delivered',
        // processing_status: 'delivered', // Column doesn't exist yet
        delivered_date: deliveredAt,
        updated_at: new Date().toISOString()
      })
      .eq('tracking_number', trackingNumber);

    if (error) {
      console.error(`❌ [${webhookId}] Error updating delivery status:`, error);
      throw error;
    }

    // Create mail event
    await createMailEvent(
      trackingNumber,
      'delivered',
      'Package delivered successfully',
      data.location?.city ? `${data.location.city}, ${data.location.state}` : 'shipengine',
      webhookId
    );

    // Send delivery notification
    await sendDeliveryNotification(trackingNumber, webhookId);

    console.log(`✅ [${webhookId}] Delivery processed for: ${trackingNumber}`);
    return { success: true, message: 'Delivery processed successfully' };
  } catch (error) {
    console.error(`❌ [${webhookId}] Error handling delivery:`, error);
    throw error;
  }
}

async function handleException(data: any, webhookId: string) {
  console.log(`⚠️ [${webhookId}] Tracking exception:`, data);
  
  const trackingNumber = data.tracking_number;
  const exception = data.exception_type;
  const description = data.description || `Exception: ${exception}`;

  try {
    // Update the mail record
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update({
        status: 'exception',
        // processing_status: exception, // Column doesn't exist yet
        updated_at: new Date().toISOString()
      })
      .eq('tracking_number', trackingNumber);

    if (error) {
      console.error(`❌ [${webhookId}] Error updating exception status:`, error);
      throw error;
    }

    // Create mail event
    await createMailEvent(
      trackingNumber,
      'exception',
      description,
      data.location?.city ? `${data.location.city}, ${data.location.state}` : 'shipengine',
      webhookId
    );

    console.log(`✅ [${webhookId}] Exception processed for: ${trackingNumber}`);
    return { success: true, message: 'Exception processed' };
  } catch (error) {
    console.error(`❌ [${webhookId}] Error handling exception:`, error);
    throw error;
  }
}

async function handleReturnToSender(data: any, webhookId: string) {
  console.log(`↩️ [${webhookId}] Package returned to sender:`, data);
  
  const trackingNumber = data.tracking_number;
  const description = data.description || 'Package returned to sender';

  try {
    // Update the mail record
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update({
        status: 'returned',
        // processing_status: 'return_to_sender', // Column doesn't exist yet
        updated_at: new Date().toISOString()
      })
      .eq('tracking_number', trackingNumber);

    if (error) {
      console.error(`❌ [${webhookId}] Error updating return status:`, error);
      throw error;
    }

    // Create mail event
    await createMailEvent(
      trackingNumber,
      'return_to_sender',
      description,
      data.location?.city ? `${data.location.city}, ${data.location.state}` : 'shipengine',
      webhookId
    );

    console.log(`✅ [${webhookId}] Return to sender processed for: ${trackingNumber}`);
    return { success: true, message: 'Return to sender processed' };
  } catch (error) {
    console.error(`❌ [${webhookId}] Error handling return to sender:`, error);
    throw error;
  }
}

async function createMailEvent(trackingNumber: string, eventType: string, description: string, location: string, webhookId: string) {
  try {
    // First get the tracking ID
    const supabase = getSupabaseClient()
    const { data: mailRecord } = await supabase
      .from('certified_mail_tracking')
      .select('id')
      .eq('tracking_number', trackingNumber)
      .single();

    if (!mailRecord) {
      console.error(`❌ [${webhookId}] Mail record not found for tracking number: ${trackingNumber}`);
      return;
    }

    const { error } = await supabase
      .from('mail_events')
      .insert({
        tracking_id: mailRecord.id,
        event_type: eventType,
        description: description,
        location: location,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error(`❌ [${webhookId}] Error creating mail event:`, error);
      throw error;
    }

    console.log(`📝 [${webhookId}] Mail event created: ${eventType} for ${trackingNumber}`);
  } catch (error) {
    console.error(`❌ [${webhookId}] Error in createMailEvent:`, error);
    throw error;
  }
}

async function sendTrackingNotification(trackingNumber: string, status: string, location: any, webhookId: string) {
  try {
    // Get the mail record with user info
    const supabase = getSupabaseClient()
    const { data: mailRecord } = await supabase
      .from('certified_mail_tracking')
      .select(`
        id,
        user_id,
        recipient_name,
        letter_subject,
        users!inner(email, first_name, last_name)
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (!mailRecord) {
      console.error(`❌ [${webhookId}] Mail record not found for tracking notification: ${trackingNumber}`);
      return;
    }

    // Send tracking notification
    await notificationService.sendTrackingUpdate({
      trackingNumber,
      recipient: mailRecord.recipient_name,
      letterSubject: mailRecord.letter_subject,
      status: status,
      location: location?.city ? `${location.city}, ${location.state}` : undefined,
      timestamp: new Date().toISOString()
    });

    console.log(`📧 [${webhookId}] Tracking notification sent for: ${trackingNumber}`);
  } catch (error) {
    console.error(`❌ [${webhookId}] Error sending tracking notification:`, error);
    // Don't throw error - notification failure shouldn't break webhook processing
  }
}

async function sendDeliveryNotification(trackingNumber: string, webhookId: string) {
  try {
    // Get the mail record with user info
    const supabase = getSupabaseClient()
    const { data: mailRecord } = await supabase
      .from('certified_mail_tracking')
      .select(`
        id,
        user_id,
        recipient_name,
        letter_subject,
        users!inner(email, first_name, last_name)
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (!mailRecord) {
      console.error(`❌ [${webhookId}] Mail record not found for delivery notification: ${trackingNumber}`);
      return;
    }

    // Send delivery notification
    await notificationService.sendDeliveryNotification({
      trackingNumber,
      recipient: mailRecord.recipient_name,
      letterSubject: mailRecord.letter_subject,
      status: 'delivered',
      timestamp: new Date().toISOString()
    });

    console.log(`📧 [${webhookId}] Delivery notification sent for: ${trackingNumber}`);
  } catch (error) {
    console.error(`❌ [${webhookId}] Error sending delivery notification:`, error);
    // Don't throw error - notification failure shouldn't break webhook processing
  }
}

function mapTrackingStatus(shipengineStatus: string): string {
  const statusMap: Record<string, string> = {
    'in_transit': 'in_transit',
    'delivered': 'delivered',
    'exception': 'failed',
    'return_to_sender': 'returned',
    'pending': 'processing'
  };
  
  return statusMap[shipengineStatus] || 'processing';
}

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'in_transit': 'Package is in transit to destination',
    'delivered': 'Package has been delivered',
    'exception': 'Package delivery exception occurred',
    'return_to_sender': 'Package is being returned to sender',
    'pending': 'Package is pending pickup',
    'picked_up': 'Package has been picked up',
    'out_for_delivery': 'Package is out for delivery'
  };
  
  return descriptions[status] || 'Status update received';
}

export async function GET() {
  return NextResponse.json({ 
    message: 'ShipEngine webhook endpoint',
    status: 'active'
  });
}
