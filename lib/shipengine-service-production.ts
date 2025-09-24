import { ShipEngine } from 'shipengine';
import { createClient } from '@supabase/supabase-js';

// Production ShipEngine Service with Real API Calls
// This replaces the mock service when ready for production

export interface CertifiedMailAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  phone?: string;
  email?: string;
}

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
    insurance?: boolean;
  };
  deliveryInstructions?: string;
}

export interface CertifiedMailResponse {
  trackingNumber: string;
  labelUrl: string;
  cost: {
    baseCost: number;
    serviceFee: number;
    additionalFees: number;
    total: number;
  };
  estimatedDelivery: string;
  serviceTier: string;
  status: string;
}

export interface ServiceRate {
  serviceCode: string;
  serviceName: string;
  cost: number;
  estimatedDelivery: string;
}

export interface PricingTier {
  name: string;
  description: string;
  basePrice: number;
  serviceFee: number;
  uspsCost: number;
  additionalServices: {
    returnReceipt: number;
    signatureConfirmation: number;
    insurance: number;
  };
}

class ShipEngineServiceProduction {
  private shipengine: ShipEngine;
  private pricingTiers: Record<string, PricingTier>;

  constructor() {
    if (!process.env.SHIPENGINE_API_KEY) {
      throw new Error('SHIPENGINE_API_KEY is required for production service');
    }

    this.shipengine = new ShipEngine({
      apiKey: process.env.SHIPENGINE_API_KEY,
      baseURL: process.env.SHIPENGINE_BASE_URL || 'https://api.shipengine.com',
    });

    this.pricingTiers = {
      basic: {
        name: 'Basic Service',
        description: 'Certified mail with tracking and basic templates',
        basePrice: 5.50,
        serviceFee: 0.10,
        uspsCost: 3.75,
        additionalServices: {
          returnReceipt: 2.75,
          signatureConfirmation: 3.50,
          insurance: 0.0
        }
      },
      premium: {
        name: 'Premium Service',
        description: 'Basic + return receipt + priority processing',
        basePrice: 7.50,
        serviceFee: 0.10,
        uspsCost: 3.75,
        additionalServices: {
          returnReceipt: 2.75,
          signatureConfirmation: 3.50,
          insurance: 0.0
        }
      },
      professional: {
        name: 'Professional Service',
        description: 'Premium + signature confirmation + insurance',
        basePrice: 9.50,
        serviceFee: 0.10,
        uspsCost: 3.75,
        additionalServices: {
          returnReceipt: 2.75,
          signatureConfirmation: 3.50,
          insurance: 0.0
        }
      }
    };
  }

  async validateAddress(address: CertifiedMailAddress): Promise<{
    isValid: boolean;
    standardizedAddress?: CertifiedMailAddress;
    suggestions?: CertifiedMailAddress[];
  }> {
    try {
      console.log('🔍 Validating address with ShipEngine API...');
      
      const validationRequest = {
        name: address.name,
        company: address.company,
        address_line1: address.address1,
        address_line2: address.address2,
        city: address.city,
        state_province: address.state,
        postal_code: address.zip,
        country_code: address.country || 'US',
        phone: address.phone,
        email: address.email,
      };

      const result = await this.shipengine.addresses.validate(validationRequest);
      
      console.log('✅ Address validation successful:', result.status);
      
      return {
        isValid: result.status === 'verified',
        standardizedAddress: result.status === 'verified' ? {
          name: result.name || address.name,
          company: result.company,
          address1: result.address_line1,
          address2: result.address_line2,
          city: result.city,
          state: result.state_province,
          zip: result.postal_code,
          country: result.country_code,
          phone: result.phone,
          email: result.email,
        } : undefined,
        suggestions: result.suggestions?.map(s => ({
          name: s.name || address.name,
          company: s.company,
          address1: s.address_line1,
          address2: s.address_line2,
          city: s.city,
          state: s.state_province,
          zip: s.postal_code,
          country: s.country_code,
          phone: s.phone,
          email: s.email,
        })),
      };
    } catch (error) {
      console.error('❌ ShipEngine address validation error:', error);
      throw new Error('Address validation failed');
    }
  }

  async getServiceRates(fromAddress: CertifiedMailAddress, toAddress: CertifiedMailAddress): Promise<ServiceRate[]> {
    try {
      console.log('💰 Getting service rates from ShipEngine...');
      
      const ratesRequest = {
        carrier_ids: ['se-123456'], // USPS carrier ID
        service_codes: ['usps_certified_mail'],
        ship_to: {
          name: toAddress.name,
          company: toAddress.company,
          address_line1: toAddress.address1,
          address_line2: toAddress.address2,
          city: toAddress.city,
          state_province: toAddress.state,
          postal_code: toAddress.zip,
          country_code: toAddress.country || 'US',
        },
        ship_from: {
          name: fromAddress.name,
          company: fromAddress.company,
          address_line1: fromAddress.address1,
          address_line2: fromAddress.address2,
          city: fromAddress.city,
          state_province: fromAddress.state,
          postal_code: fromAddress.zip,
          country_code: fromAddress.country || 'US',
        },
        packages: [{
          weight: {
            value: 1.0,
            unit: 'ounce'
          },
          dimensions: {
            length: 11,
            width: 8.5,
            height: 0.1,
            unit: 'inch'
          }
        }]
      };

      const rates = await this.shipengine.rates.getRates(ratesRequest);
      
      console.log('✅ Service rates retrieved:', rates.length, 'rates');
      
      return rates.map(rate => ({
        serviceCode: rate.service_code,
        serviceName: rate.service_name,
        cost: parseFloat(rate.shipping_amount.amount),
        estimatedDelivery: rate.estimated_delivery_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('❌ ShipEngine rates error:', error);
      throw new Error('Failed to get service rates');
    }
  }

  async createMailLabel(request: CertifiedMailRequest): Promise<CertifiedMailResponse> {
    try {
      console.log('📦 Creating certified mail label with ShipEngine...');
      
      // Calculate costs
      const costBreakdown = this.calculateCost(request.serviceTier, request.additionalServices);
      
      // Prepare label request
      const labelRequest = {
        shipment: {
          service_code: 'usps_certified_mail',
          ship_to: {
            name: request.recipient.name,
            company: request.recipient.company,
            address_line1: request.recipient.address.address1,
            address_line2: request.recipient.address.address2,
            city: request.recipient.address.city,
            state_province: request.recipient.address.state,
            postal_code: request.recipient.address.zip,
            country_code: request.recipient.address.country || 'US',
            phone: request.recipient.address.phone,
            email: request.recipient.address.email,
          },
          ship_from: {
            name: request.sender.name,
            company: request.sender.company,
            address_line1: request.sender.address.address1,
            address_line2: request.sender.address.address2,
            city: request.sender.address.city,
            state_province: request.sender.address.state,
            postal_code: request.sender.address.zip,
            country_code: request.sender.address.country || 'US',
            phone: request.sender.address.phone,
            email: request.sender.address.email,
          },
          packages: [{
            package_code: 'package',
            weight: {
              value: 1.0,
              unit: 'ounce'
            },
            dimensions: {
              length: 11,
              width: 8.5,
              height: 0.1,
              unit: 'inch'
            }
          }]
        },
        is_return_label: false,
        test_label: process.env.NODE_ENV === 'development'
      };

      // Add service-specific options
      if (request.serviceTier === 'premium') {
        labelRequest.shipment.confirmations = ['delivery'];
      }

      if (request.serviceTier === 'professional') {
        labelRequest.shipment.confirmations = ['delivery', 'signature'];
        labelRequest.shipment.insurance_provider = 'usps';
        labelRequest.shipment.insured_value = {
          amount: 50.00,
          currency: 'usd',
        };
      }

      // Create the label
      const label = await this.shipengine.labels.create(labelRequest);

      console.log('✅ Label created successfully:', label.tracking_number);

      return {
        trackingNumber: label.tracking_number,
        labelUrl: label.label_download.url,
        cost: {
          baseCost: costBreakdown.baseCost,
          serviceFee: costBreakdown.serviceFee,
          additionalFees: costBreakdown.additionalFees,
          total: costBreakdown.total,
        },
        estimatedDelivery: label.estimated_delivery_date,
        serviceTier: request.serviceTier,
        status: 'created',
      };
    } catch (error) {
      console.error('❌ ShipEngine label creation error:', error);
      throw new Error('Failed to create certified mail label');
    }
  }

  async getTrackingInfo(trackingNumber: string): Promise<{
    trackingNumber: string;
    status: string;
    events: Array<{
      event: string;
      timestamp: string;
      location: string;
      details: string;
    }>;
    estimatedDelivery?: string;
  }> {
    try {
      console.log('🔍 Getting tracking info from ShipEngine...');
      
      const trackingInfo = await this.shipengine.tracking.getTrackingInfo({
        trackingNumber: trackingNumber
      });

      console.log('✅ Tracking info retrieved:', trackingInfo.status);

      return {
        trackingNumber: trackingInfo.tracking_number,
        status: trackingInfo.status,
        events: trackingInfo.events?.map(event => ({
          event: event.event,
          timestamp: event.timestamp,
          location: event.location?.city ? 
            `${event.location.city}, ${event.location.state}` : 
            event.location?.description || 'Unknown',
          details: event.description || event.event
        })) || [],
        estimatedDelivery: trackingInfo.estimated_delivery_date
      };
    } catch (error) {
      console.error('❌ ShipEngine tracking error:', error);
      throw new Error('Failed to get tracking information');
    }
  }

  private calculateCost(serviceTier: string, additionalServices?: any): {
    baseCost: number;
    serviceFee: number;
    additionalFees: number;
    total: number;
  } {
    const tier = this.pricingTiers[serviceTier];
    if (!tier) {
      throw new Error(`Invalid service tier: ${serviceTier}`);
    }

    let additionalFees = 0;
    if (additionalServices) {
      if (additionalServices.returnReceipt) additionalFees += tier.additionalServices.returnReceipt;
      if (additionalServices.signatureConfirmation) additionalFees += tier.additionalServices.signatureConfirmation;
      if (additionalServices.insurance) additionalFees += tier.additionalServices.insurance;
    }

    const baseCost = tier.uspsCost;
    const serviceFee = tier.serviceFee;
    const total = baseCost + serviceFee + additionalFees;

    return {
      baseCost,
      serviceFee,
      additionalFees,
      total
    };
  }

  getPricingTiers(): Record<string, PricingTier> {
    return this.pricingTiers;
  }
}

export const shipEngineServiceProduction = new ShipEngineServiceProduction();
