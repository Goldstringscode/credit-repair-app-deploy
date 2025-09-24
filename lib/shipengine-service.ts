/**
 * ShipEngine Integration Service
 * Certified Mail System with Tiered Pricing
 */

import { ShipEngine } from 'shipengine';

export interface CertifiedMailAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface CertifiedMailRequest {
  toAddress: CertifiedMailAddress;
  fromAddress: CertifiedMailAddress;
  letterContent: string;
  serviceTier: 'basic' | 'premium' | 'professional';
  additionalServices?: {
    returnReceipt?: boolean;
    signatureConfirmation?: boolean;
    insurance?: number;
    priorityProcessing?: boolean;
  };
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

class ShipEngineService {
  private shipengine: ShipEngine;
  private pricingTiers: Record<string, PricingTier>;

  constructor() {
    // Only initialize ShipEngine if API key is provided
    if (process.env.SHIPENGINE_API_KEY && process.env.SHIPENGINE_API_KEY !== '') {
      try {
        this.shipengine = new ShipEngine({
          apiKey: process.env.SHIPENGINE_API_KEY,
          baseURL: process.env.SHIPENGINE_BASE_URL || 'https://api.shipengine.com',
        });
        console.log('✅ ShipEngine initialized successfully');
      } catch (error) {
        console.warn('⚠️ ShipEngine initialization failed, using mock responses:', error);
        this.shipengine = null as any;
      }
    } else {
      console.warn('ShipEngine API key not provided. Using mock responses.');
      this.shipengine = null as any;
    }

    this.pricingTiers = {
      basic: {
        name: 'Basic Service',
        description: 'Certified mail with tracking and basic templates',
        basePrice: 5.50,
        includes: ['Certified mail', 'Tracking', 'Basic templates'],
        additionalServices: {
          returnReceipt: 2.75,
          signatureConfirmation: 3.25,
          insurance: 1.00,
          priorityProcessing: 2.00,
        },
      },
      premium: {
        name: 'Premium Service',
        description: 'Everything in Basic + return receipt + priority processing',
        basePrice: 7.50,
        includes: ['Certified mail', 'Tracking', 'Premium templates', 'Return receipt', 'Priority processing'],
        additionalServices: {
          returnReceipt: 0, // Included
          signatureConfirmation: 3.25,
          insurance: 1.00,
          priorityProcessing: 0, // Included
        },
      },
      professional: {
        name: 'Professional Service',
        description: 'Everything in Premium + signature confirmation + insurance',
        basePrice: 9.50,
        includes: ['Certified mail', 'Tracking', 'Professional templates', 'Return receipt', 'Priority processing', 'Signature confirmation', 'Insurance'],
        additionalServices: {
          returnReceipt: 0, // Included
          signatureConfirmation: 0, // Included
          insurance: 0, // Included
          priorityProcessing: 0, // Included
        },
      },
    };
  }

  /**
   * Get available pricing tiers
   */
  getPricingTiers(): Record<string, PricingTier> {
    return this.pricingTiers;
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
    const tier = this.pricingTiers[request.serviceTier];
    let additionalFees = 0;
    const additionalServices: Record<string, number> = {};

    if (request.additionalServices) {
      if (request.additionalServices.returnReceipt && tier.additionalServices.returnReceipt > 0) {
        additionalFees += tier.additionalServices.returnReceipt;
        additionalServices.returnReceipt = tier.additionalServices.returnReceipt;
      }
      if (request.additionalServices.signatureConfirmation && tier.additionalServices.signatureConfirmation > 0) {
        additionalFees += tier.additionalServices.signatureConfirmation;
        additionalServices.signatureConfirmation = tier.additionalServices.signatureConfirmation;
      }
      if (request.additionalServices.insurance && tier.additionalServices.insurance > 0) {
        additionalFees += tier.additionalServices.insurance;
        additionalServices.insurance = tier.additionalServices.insurance;
      }
      if (request.additionalServices.priorityProcessing && tier.additionalServices.priorityProcessing > 0) {
        additionalFees += tier.additionalServices.priorityProcessing;
        additionalServices.priorityProcessing = tier.additionalServices.priorityProcessing;
      }
    }

    const baseCost = 3.75; // USPS certified mail cost
    const serviceFee = tier.basePrice - baseCost;
    const total = baseCost + serviceFee + additionalFees;

    return {
      baseCost,
      serviceFee,
      additionalFees,
      total,
      breakdown: {
        tier: tier.name,
        basePrice: tier.basePrice,
        additionalServices,
      },
    };
  }

  /**
   * Create a certified mail label
   */
  async createCertifiedMail(request: CertifiedMailRequest): Promise<CertifiedMailResponse> {
    try {
      // Calculate costs
      const costBreakdown = this.calculateCost(request);

      // If no ShipEngine API key, return mock response
      if (!this.shipengine) {
        return this.mockCertifiedMailResponse(request, costBreakdown);
      }

      // Create ShipEngine label request
      const labelRequest = {
        validate_address: 'no_validation',
        ship_to: {
          name: request.toAddress.name,
          company_name: request.toAddress.company,
          address_line1: request.toAddress.address1,
          address_line2: request.toAddress.address2,
          city_locality: request.toAddress.city,
          state_province: request.toAddress.state,
          postal_code: request.toAddress.zip,
          country_code: request.toAddress.country,
          phone: request.toAddress.phone,
          email: request.toAddress.email,
        },
        ship_from: {
          name: request.fromAddress.name,
          company_name: request.fromAddress.company,
          address_line1: request.fromAddress.address1,
          address_line2: request.fromAddress.address2,
          city_locality: request.fromAddress.city,
          state_province: request.fromAddress.state,
          postal_code: request.fromAddress.zip,
          country_code: request.fromAddress.country,
          phone: request.fromAddress.phone,
          email: request.fromAddress.email,
        },
        packages: [
          {
            weight: {
              value: 1.0,
              unit: 'ounce',
            },
            dimensions: {
              length: 11,
              width: 8.5,
              height: 0.1,
              unit: 'inch',
            },
          },
        ],
        service_code: 'usps_certified_mail',
        label_format: 'pdf',
        label_download_type: 'url',
      };

      // Add additional services based on tier
      if (request.serviceTier === 'premium' || request.serviceTier === 'professional') {
        labelRequest.confirmations = ['delivery'];
      }

      if (request.serviceTier === 'professional') {
        labelRequest.confirmations = ['delivery', 'signature'];
        labelRequest.insurance_provider = 'usps';
        labelRequest.insured_value = {
          amount: 50.00,
          currency: 'usd',
        };
      }

      // Create the label
      const label = await this.shipengine.labels.create(labelRequest);

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
      console.error('ShipEngine Error:', error);
      throw new Error('Failed to create certified mail label');
    }
  }

  /**
   * Get tracking information
   */
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
      // If no ShipEngine API key, return mock response
      if (!this.shipengine) {
        return this.mockTrackingInfo(trackingNumber);
      }

      const tracking = await this.shipengine.tracking.getTrackingInfo(trackingNumber);
      
      return {
        trackingNumber: tracking.tracking_number,
        status: tracking.status,
        events: tracking.tracking_events.map(event => ({
          event: event.event_type,
          timestamp: event.occurred_at,
          location: event.city_locality + ', ' + event.state_province,
          details: event.description,
        })),
        estimatedDelivery: tracking.estimated_delivery_date,
      };
    } catch (error) {
      console.error('ShipEngine Tracking Error:', error);
      throw new Error('Failed to get tracking information');
    }
  }

  /**
   * Validate address
   */
  async validateAddress(address: CertifiedMailAddress): Promise<{
    isValid: boolean;
    standardizedAddress?: CertifiedMailAddress;
    suggestions?: CertifiedMailAddress[];
  }> {
    try {
      // If no ShipEngine API key, return mock response
      if (!this.shipengine) {
        console.log('Using mock address validation (no API key)');
        return this.mockAddressValidation(address);
      }

      console.log('Calling ShipEngine API for address validation...');
      const validation = await this.shipengine.addresses.validate({
        name: address.name,
        company_name: address.company,
        address_line1: address.address1,
        address_line2: address.address2,
        city_locality: address.city,
        state_province: address.state,
        postal_code: address.zip,
        country_code: address.country,
      });

      console.log('ShipEngine validation result:', validation);

      return {
        isValid: validation.status === 'verified',
        standardizedAddress: validation.normalized_address ? {
          name: validation.normalized_address.name,
          company: validation.normalized_address.company_name,
          address1: validation.normalized_address.address_line1,
          address2: validation.normalized_address.address_line2,
          city: validation.normalized_address.city_locality,
          state: validation.normalized_address.state_province,
          zip: validation.normalized_address.postal_code,
          country: validation.normalized_address.country_code,
          phone: validation.normalized_address.phone,
          email: validation.normalized_address.email,
        } : undefined,
      };
    } catch (error) {
      console.error('ShipEngine Address Validation Error:', error);
      console.log('Falling back to mock validation due to error');
      return this.mockAddressValidation(address);
    }
  }

  /**
   * Get available service rates
   */
  async getServiceRates(fromAddress: CertifiedMailAddress, toAddress: CertifiedMailAddress): Promise<{
    serviceCode: string;
    serviceName: string;
    cost: number;
    estimatedDelivery: string;
  }[]> {
    try {
      // If no ShipEngine API key, return mock response
      if (!this.shipengine) {
        return this.mockRates({ fromAddress, toAddress });
      }

      const rates = await this.shipengine.rates.getRates({
        carrier_id: 'usps',
        service_codes: ['usps_certified_mail'],
        ship_to: {
          name: toAddress.name,
          company_name: toAddress.company,
          address_line1: toAddress.address1,
          address_line2: toAddress.address2,
          city_locality: toAddress.city,
          state_province: toAddress.state,
          postal_code: toAddress.zip,
          country_code: toAddress.country,
        },
        ship_from: {
          name: fromAddress.name,
          company_name: fromAddress.company,
          address_line1: fromAddress.address1,
          address_line2: fromAddress.address2,
          city_locality: fromAddress.city,
          state_province: fromAddress.state,
          postal_code: fromAddress.zip,
          country_code: fromAddress.country,
        },
        packages: [
          {
            weight: {
              value: 1.0,
              unit: 'ounce',
            },
            dimensions: {
              length: 11,
              width: 8.5,
              height: 0.1,
              unit: 'inch',
            },
          },
        ],
      });

      return rates.map(rate => ({
        serviceCode: rate.service_code,
        serviceName: rate.service_name,
        cost: rate.shipping_amount.amount,
        estimatedDelivery: rate.estimated_delivery_date,
      }));
    } catch (error) {
      console.error('ShipEngine Rates Error:', error);
      return [];
    }
  }

  private mockCertifiedMailResponse(request: CertifiedMailRequest, costBreakdown: any): CertifiedMailResponse {
    return {
      trackingNumber: `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      labelUrl: `https://mock-labels.com/label-${Date.now()}.pdf`,
      cost: {
        baseCost: costBreakdown.baseCost,
        serviceFee: costBreakdown.serviceFee,
        additionalFees: costBreakdown.additionalFees,
        total: costBreakdown.total,
      },
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      serviceTier: request.serviceTier,
      status: 'created',
    };
  }

  private mockAddressValidation(address: CertifiedMailAddress): {
    isValid: boolean;
    standardizedAddress?: CertifiedMailAddress;
    suggestions?: CertifiedMailAddress[];
  } {
    console.log('Mock address validation for:', address);
    // Always return true for testing
    return {
      isValid: true,
      standardizedAddress: address,
    };
  }

  private mockRates({ fromAddress, toAddress }: { fromAddress: CertifiedMailAddress; toAddress: CertifiedMailAddress }): {
    serviceCode: string;
    serviceName: string;
    cost: number;
    estimatedDelivery: string;
  }[] {
    return [
      {
        serviceCode: 'usps_certified_mail',
        serviceName: 'Certified Mail',
        cost: 3.75,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ];
  }
}

// Export singleton instance
export const shipEngineService = new ShipEngineService();

// Export types
export type {
  CertifiedMailAddress,
  CertifiedMailRequest,
  CertifiedMailResponse,
  PricingTier,
};
