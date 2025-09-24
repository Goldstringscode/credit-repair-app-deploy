/**
 * Certified Mail Service with ShipEngine Integration
 * Tiered Pricing Model Implementation
 */

import { shipEngineService, type CertifiedMailAddress, type CertifiedMailRequest as ShipEngineRequest } from './shipengine-service';
import { stripeMailPayments } from './stripe-mail-payments';

export interface CertifiedMailRequest {
  userId: string;
  recipient: {
    name: string;
    company?: string;
    address: CertifiedMailAddress;
  };
  sender: {
    name: string;
    company?: string;
    address: CertifiedMailAddress;
  };
  letter: {
    subject: string;
    content: string;
    type: string;
    templateId?: string;
  };
  serviceTier: 'basic' | 'premium' | 'professional';
  additionalServices?: {
    returnReceipt?: boolean;
    signatureConfirmation?: boolean;
    insurance?: number;
    priorityProcessing?: boolean;
  };
  deliveryInstructions?: string;
}

export interface CertifiedMailResponse {
  trackingId: string;
  trackingNumber: string;
  status: string;
  cost: {
    baseCost: number;
    serviceFee: number;
    additionalFees: number;
    total: number;
  };
  estimatedDelivery: string;
  labelUrl?: string;
  serviceTier: string;
}

export interface CertifiedMailStatus {
  trackingId: string;
  trackingNumber: string;
  status: string;
  processingStatus: string;
  paymentStatus: string;
  events: Array<{
    eventType: string;
    description: string;
    location?: string;
    timestamp: string;
    source: string;
  }>;
  sentDate?: string;
  deliveredDate?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  cost: {
    baseCost: number;
    serviceFee: number;
    additionalFees: number;
    total: number;
  };
  serviceTier: string;
  errorMessage?: string;
}

export interface MailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: Record<string, string>;
  isActive: boolean;
  isPremium: boolean;
}

export interface PricingTier {
  name: string;
  description: string;
  basePrice: number;
  includes: string[];
  additionalServices: {
    returnReceipt: number;
    signatureConfirmation: number;
    insurance: number;
    priorityProcessing: number;
  };
}

class CertifiedMailServiceShipEngine {
  private db: any; // Will be replaced with actual database connection

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    console.log('Initializing certified mail database connection...');
  }

  /**
   * Get available pricing tiers
   */
  getPricingTiers(): Record<string, PricingTier> {
    return shipEngineService.getPricingTiers();
  }

  /**
   * Calculate cost for a certified mail request
   */
  calculateCost(request: CertifiedMailRequest): {
    baseCost: number;
    serviceFee: number;
    additionalFees: number;
    total: number;
    breakdown: {
      tier: string;
      basePrice: number;
      additionalServices: Record<string, number>;
    };
  } {
    const shipEngineRequest: ShipEngineRequest = {
      toAddress: request.recipient.address,
      fromAddress: request.sender.address,
      letterContent: request.letter.content,
      serviceTier: request.serviceTier,
      additionalServices: request.additionalServices,
    };

    return shipEngineService.calculateCost(shipEngineRequest);
  }

  /**
   * Create a new certified mail request
   */
  async createMailRequest(request: CertifiedMailRequest): Promise<CertifiedMailResponse> {
    try {
      // 1. Validate addresses (simplified for testing)
      console.log('Validating addresses...');
      const recipientValidation = await shipEngineService.validateAddress(request.recipient.address);
      const senderValidation = await shipEngineService.validateAddress(request.sender.address);

      console.log('Recipient validation:', recipientValidation);
      console.log('Sender validation:', senderValidation);

      if (!recipientValidation.isValid) {
        console.error('Recipient address validation failed:', recipientValidation);
        throw new Error('Invalid recipient address');
      }

      if (!senderValidation.isValid) {
        console.error('Sender address validation failed:', senderValidation);
        throw new Error('Invalid sender address');
      }

      // 2. Calculate costs
      console.log('Calculating costs...');
      const costBreakdown = this.calculateCost(request);
      console.log('Cost breakdown:', costBreakdown);

      // 3. Generate tracking number
      console.log('Generating tracking numbers...');
      const trackingNumber = this.generateTrackingNumber();
      const trackingId = this.generateTrackingId();
      console.log('Tracking number:', trackingNumber);
      console.log('Tracking ID:', trackingId);

      // 4. Create database record
      console.log('Creating database record...');
      const mailRecord = {
        id: trackingId,
        user_id: request.userId,
        tracking_number: trackingNumber,
        recipient_name: request.recipient.name,
        recipient_address: JSON.stringify(request.recipient.address),
        sender_name: request.sender.name,
        sender_address: JSON.stringify(request.sender.address),
        letter_content: request.letter.content,
        mail_service: request.serviceTier,
        cost: costBreakdown.total,
        status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Mail record created:', mailRecord);

      // Store in database
      console.log('Storing in database...');
      await this.storeMailRecord(mailRecord);
      console.log('Database record stored successfully');

      // 5. Create initial event
      await this.createMailEvent(trackingId, 'created', 'Mail request created', 'system');

      return {
        trackingId,
        trackingNumber,
        status: 'processing',
        cost: {
          baseCost: costBreakdown.baseCost,
          serviceFee: costBreakdown.serviceFee,
          additionalFees: costBreakdown.additionalFees,
          total: costBreakdown.total,
        },
        estimatedDelivery: this.calculateEstimatedDelivery(request.serviceTier),
        serviceTier: request.serviceTier,
      };
    } catch (error) {
      console.error('Error creating mail request:', error);
      throw new Error(`Failed to create mail request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process payment and send mail
   */
  async processPaymentAndSend(trackingId: string, paymentIntentId: string): Promise<CertifiedMailResponse> {
    try {
      // 1. Update payment status
      await this.updateMailRecord(trackingId, {
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
        processing_status: 'validating',
      });

      // 2. Create payment event
      await this.createMailEvent(trackingId, 'payment_completed', 'Payment processed successfully', 'stripe');

      // 3. Get mail record
      const mailRecord = await this.getMailRecord(trackingId);
      if (!mailRecord) {
        throw new Error('Mail record not found');
      }

      // 4. Create ShipEngine label
      const shipEngineRequest: ShipEngineRequest = {
        toAddress: JSON.parse(mailRecord.recipient_address),
        fromAddress: JSON.parse(mailRecord.sender_address),
        letterContent: mailRecord.letter_content,
        serviceTier: mailRecord.service_tier,
        additionalServices: JSON.parse(mailRecord.additional_services || '{}'),
      };

      const labelResponse = await shipEngineService.createCertifiedMail(shipEngineRequest);

      // 5. Update with ShipEngine tracking info
      await this.updateMailRecord(trackingId, {
        shipengine_tracking_id: labelResponse.trackingNumber,
        status: 'sent',
        processing_status: 'completed',
        sent_date: new Date().toISOString(),
        label_url: labelResponse.labelUrl,
      });

      // 6. Create sent event
      await this.createMailEvent(trackingId, 'sent', 'Mail sent via ShipEngine', 'shipengine');

      return {
        trackingId,
        trackingNumber: mailRecord.tracking_number,
        status: 'sent',
        cost: labelResponse.cost,
        estimatedDelivery: labelResponse.estimatedDelivery,
        labelUrl: labelResponse.labelUrl,
        serviceTier: mailRecord.service_tier,
      };
    } catch (error) {
      console.error('Error processing payment and sending mail:', error);

      // Update status to failed
      await this.updateMailRecord(trackingId, {
        status: 'failed',
        processing_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.createMailEvent(trackingId, 'failed', 'Failed to process payment and send mail', 'system');

      throw new Error(`Failed to process payment and send mail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get mail status and tracking information
   */
  async getMailStatus(trackingId: string): Promise<CertifiedMailStatus> {
    try {
      // Get mail record from database
      const mailRecord = await this.getMailRecord(trackingId);
      if (!mailRecord) {
        throw new Error('Mail record not found');
      }

      // Get events
      const events = await this.getMailEvents(trackingId);

      // If we have a ShipEngine tracking number, get real-time tracking
      if (mailRecord.shipengine_tracking_id) {
        try {
          const shipEngineTracking = await shipEngineService.getTrackingInfo(mailRecord.shipengine_tracking_id);

          // Update status based on ShipEngine tracking
          if (shipEngineTracking.status !== mailRecord.status) {
            await this.updateMailRecord(trackingId, {
              status: this.mapShipEngineStatusToInternal(shipEngineTracking.status),
            });
          }

          // Add ShipEngine events
          shipEngineTracking.events.forEach((event) => {
            events.push({
              eventType: 'shipengine_update',
              description: event.details,
              location: event.location,
              timestamp: event.timestamp,
              source: 'shipengine',
            });
          });
        } catch (error) {
          console.warn('Failed to get ShipEngine tracking info:', error);
        }
      }

      return {
        trackingId: mailRecord.id,
        trackingNumber: mailRecord.tracking_number,
        status: mailRecord.status,
        processingStatus: mailRecord.processing_status,
        paymentStatus: mailRecord.payment_status,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        sentDate: mailRecord.sent_date,
        deliveredDate: mailRecord.delivered_date,
        estimatedDelivery: mailRecord.estimated_delivery,
        actualDelivery: mailRecord.actual_delivery,
        cost: {
          baseCost: mailRecord.base_cost,
          serviceFee: mailRecord.service_fee,
          additionalFees: mailRecord.additional_fees,
          total: mailRecord.total_cost,
        },
        serviceTier: mailRecord.service_tier,
        errorMessage: mailRecord.error_message,
      };
    } catch (error) {
      console.error('Error getting mail status:', error);
      throw new Error(`Failed to get mail status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available mail templates
   */
  async getMailTemplates(category?: string): Promise<MailTemplate[]> {
    try {
      // This would query the database for templates
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'Basic Dispute Letter',
          description: 'Standard credit report dispute letter',
          category: 'dispute',
          content: 'Template content...',
          variables: {
            your_name: 'string',
            your_address: 'string',
            disputed_items: 'string',
          },
          isActive: true,
          isPremium: false,
        },
        {
          id: '2',
          name: 'Premium Dispute Letter',
          description: 'Enhanced dispute letter with legal language',
          category: 'dispute',
          content: 'Premium template content...',
          variables: {
            your_name: 'string',
            your_address: 'string',
            disputed_items: 'string',
            creditor_name: 'string',
          },
          isActive: true,
          isPremium: true,
        },
      ];
    } catch (error) {
      console.error('Error getting mail templates:', error);
      return [];
    }
  }

  /**
   * Get service rates from ShipEngine
   */
  async getServiceRates(fromAddress: CertifiedMailAddress, toAddress: CertifiedMailAddress): Promise<{
    serviceCode: string;
    serviceName: string;
    cost: number;
    estimatedDelivery: string;
  }[]> {
    try {
      return await shipEngineService.getServiceRates(fromAddress, toAddress);
    } catch (error) {
      console.error('Error getting service rates:', error);
      return [];
    }
  }

  // Private helper methods

  private generateTrackingNumber(): string {
    return `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateTrackingId(): string {
    // Generate a valid UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private calculateEstimatedDelivery(serviceTier: string): string {
    const deliveryDays: Record<string, number> = {
      basic: 3,
      premium: 2,
      professional: 1,
    };

    const days = deliveryDays[serviceTier] || 3;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);

    return deliveryDate.toISOString().split('T')[0];
  }

  private mapShipEngineStatusToInternal(shipEngineStatus: string): string {
    const statusMap: Record<string, string> = {
      accepted: 'sent',
      in_transit: 'in_transit',
      out_for_delivery: 'in_transit',
      delivered: 'delivered',
      returned: 'returned',
      failed: 'failed',
    };

    return statusMap[shipEngineStatus] || 'in_transit';
  }

  // Database methods (mock implementations for now)

  private async storeMailRecord(record: any): Promise<void> {
    // Real Supabase implementation
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase
      .from('certified_mail_tracking')
      .insert([record]);

    if (error) {
      console.error('Error storing mail record:', error);
      console.error('Record that failed:', record);
      throw new Error(`Failed to store mail record: ${error.message}`);
    }

    console.log('Stored mail record:', record.id);
  }

  private async getMailRecord(trackingId: string): Promise<any> {
    // Real Supabase implementation
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('certified_mail_tracking')
      .select('*')
      .eq('id', trackingId)
      .single();

    if (error) {
      console.error('Error getting mail record:', error);
      return null;
    }

    return data;
  }

  private async updateMailRecord(trackingId: string, updates: any): Promise<void> {
    // Real Supabase implementation
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase
      .from('certified_mail_tracking')
      .update(updates)
      .eq('id', trackingId);

    if (error) {
      console.error('Error updating mail record:', error);
      throw new Error('Failed to update mail record');
    }

    console.log('Updated mail record:', trackingId, updates);
  }

  private async createMailEvent(trackingId: string, eventType: string, description: string, source: string): Promise<void> {
    // Real Supabase implementation
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase
      .from('mail_events')
      .insert([{
        tracking_id: trackingId,
        event_type: eventType,
        description: description,
        location: source,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creating mail event:', error);
      throw new Error('Failed to create mail event');
    }

    console.log('Created mail event:', { trackingId, eventType, description, source });
  }

  private async getMailEvents(trackingId: string): Promise<Array<{
    eventType: string;
    description: string;
    location?: string;
    timestamp: string;
    source: string;
  }>> {
    // Real Supabase implementation
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('mail_events')
      .select('*')
      .eq('tracking_id', trackingId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error getting mail events:', error);
      return [];
    }

    return data.map(event => ({
      eventType: event.event_type,
      description: event.description,
      location: event.location,
      timestamp: event.timestamp,
      source: event.location || 'system',
    }));
  }
}

// Export singleton instance
export const certifiedMailService = new CertifiedMailServiceShipEngine();

// Export types
export type {
  CertifiedMailRequest,
  CertifiedMailResponse,
  CertifiedMailStatus,
  MailTemplate,
  PricingTier,
};
