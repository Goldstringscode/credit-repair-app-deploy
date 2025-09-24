/**
 * USPS API Integration Service
 * Phase 1: Core Infrastructure for Certified Mail System
 */

export interface USPSAddress {
  address1: string
  address2?: string
  city: string
  state: string
  zip5: string
  zip4?: string
}

export interface USPSAddressValidation {
  isValid: boolean
  standardizedAddress?: USPSAddress
  errorMessage?: string
  suggestions?: USPSAddress[]
}

export interface USPSTrackingEvent {
  event: string
  timestamp: string
  location: string
  details: string
}

export interface USPSTrackingInfo {
  trackingNumber: string
  status: string
  events: USPSTrackingEvent[]
  estimatedDelivery?: string
  actualDelivery?: string
}

export interface USPSLabelRequest {
  toAddress: USPSAddress
  fromAddress: USPSAddress
  serviceType: string
  weight: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  returnReceipt?: boolean
  signatureConfirmation?: boolean
  insurance?: number
}

export interface USPSLabelResponse {
  trackingNumber: string
  labelUrl: string
  cost: number
  serviceType: string
  estimatedDelivery: string
}

export interface USPSRateRequest {
  toAddress: USPSAddress
  fromAddress: USPSAddress
  serviceTypes: string[]
  weight: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export interface USPSRateResponse {
  serviceType: string
  cost: number
  deliveryTime: number
  trackingIncluded: boolean
  signatureRequired: boolean
  insuranceIncluded: number
}

class USPSAPIService {
  private baseUrl: string
  private apiKey: string
  private userId: string

  constructor() {
    this.baseUrl = process.env.USPS_BASE_URL || 'https://secure.shippingapis.com/ShippingAPI.dll'
    this.apiKey = process.env.USPS_API_KEY || ''
    this.userId = process.env.USPS_USER_ID || ''
    
    if (!this.apiKey || !this.userId) {
      console.warn('USPS API credentials not configured. Using mock responses.')
    }
  }

  /**
   * Validate and standardize an address using USPS Address Validation API
   */
  async validateAddress(address: USPSAddress): Promise<USPSAddressValidation> {
    if (!this.apiKey || !this.userId) {
      // Return mock validation for development
      return this.mockAddressValidation(address)
    }

    try {
      const params = new URLSearchParams({
        API: 'Verify',
        XML: this.buildAddressValidationXML(address)
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const xmlText = await response.text()
      
      return this.parseAddressValidationResponse(xmlText)
    } catch (error) {
      console.error('USPS Address Validation Error:', error)
      return {
        isValid: false,
        errorMessage: 'Address validation service unavailable'
      }
    }
  }

  /**
   * Get tracking information for a USPS tracking number
   */
  async getTrackingInfo(trackingNumber: string): Promise<USPSTrackingInfo> {
    if (!this.apiKey || !this.userId) {
      // Return mock tracking for development
      return this.mockTrackingInfo(trackingNumber)
    }

    try {
      const params = new URLSearchParams({
        API: 'TrackV2',
        XML: this.buildTrackingXML(trackingNumber)
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const xmlText = await response.text()
      
      return this.parseTrackingResponse(xmlText)
    } catch (error) {
      console.error('USPS Tracking Error:', error)
      return {
        trackingNumber,
        status: 'error',
        events: [],
        errorMessage: 'Tracking service unavailable'
      }
    }
  }

  /**
   * Get shipping rates for different service types
   */
  async getRates(request: USPSRateRequest): Promise<USPSRateResponse[]> {
    if (!this.apiKey || !this.userId) {
      // Return mock rates for development
      return this.mockRates(request)
    }

    try {
      const params = new URLSearchParams({
        API: 'RateV4',
        XML: this.buildRateRequestXML(request)
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const xmlText = await response.text()
      
      return this.parseRateResponse(xmlText)
    } catch (error) {
      console.error('USPS Rate Error:', error)
      return []
    }
  }

  /**
   * Create a shipping label (Click-N-Ship API)
   */
  async createLabel(request: USPSLabelRequest): Promise<USPSLabelResponse> {
    if (!this.apiKey || !this.userId) {
      // Return mock label for development
      return this.mockLabelResponse(request)
    }

    try {
      const params = new URLSearchParams({
        API: 'ClickNConfirm',
        XML: this.buildLabelRequestXML(request)
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      const xmlText = await response.text()
      
      return this.parseLabelResponse(xmlText)
    } catch (error) {
      console.error('USPS Label Creation Error:', error)
      throw new Error('Label creation service unavailable')
    }
  }

  // Private helper methods

  private buildAddressValidationXML(address: USPSAddress): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<AddressValidateRequest USERID="${this.userId}">
  <Address ID="1">
    <Address1>${address.address1}</Address1>
    ${address.address2 ? `<Address2>${address.address2}</Address2>` : ''}
    <City>${address.city}</City>
    <State>${address.state}</State>
    <Zip5>${address.zip5}</Zip5>
    ${address.zip4 ? `<Zip4>${address.zip4}</Zip4>` : ''}
  </Address>
</AddressValidateRequest>`
  }

  private buildTrackingXML(trackingNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<TrackRequest USERID="${this.userId}">
  <TrackID ID="${trackingNumber}"></TrackID>
</TrackRequest>`
  }

  private buildRateRequestXML(request: USPSRateRequest): string {
    const services = request.serviceTypes.map(type => `<Service>${type}</Service>`).join('')
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<RateV4Request USERID="${this.userId}">
  <Package ID="1">
    <Service>${request.serviceTypes[0]}</Service>
    <ZipOrigination>${request.fromAddress.zip5}</ZipOrigination>
    <ZipDestination>${request.toAddress.zip5}</ZipDestination>
    <Pounds>${Math.floor(request.weight)}</Pounds>
    <Ounces>${Math.round((request.weight % 1) * 16)}</Ounces>
    ${request.dimensions ? `
    <Length>${request.dimensions.length}</Length>
    <Width>${request.dimensions.width}</Width>
    <Height>${request.dimensions.height}</Height>
    ` : ''}
    <Machinable>True</Machinable>
  </Package>
</RateV4Request>`
  }

  private buildLabelRequestXML(request: USPSLabelRequest): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ClickNConfirmRequest USERID="${this.userId}">
  <LabelRequest>
    <ToAddress>
      <Name>${request.toAddress.address1}</Name>
      <Address1>${request.toAddress.address1}</Address1>
      ${request.toAddress.address2 ? `<Address2>${request.toAddress.address2}</Address2>` : ''}
      <City>${request.toAddress.city}</City>
      <State>${request.toAddress.state}</State>
      <Zip5>${request.toAddress.zip5}</Zip5>
      ${request.toAddress.zip4 ? `<Zip4>${request.toAddress.zip4}</Zip4>` : ''}
    </ToAddress>
    <FromAddress>
      <Name>${request.fromAddress.address1}</Name>
      <Address1>${request.fromAddress.address1}</Address1>
      ${request.fromAddress.address2 ? `<Address2>${request.fromAddress.address2}</Address2>` : ''}
      <City>${request.fromAddress.city}</City>
      <State>${request.fromAddress.state}</State>
      <Zip5>${request.fromAddress.zip5}</Zip5>
      ${request.fromAddress.zip4 ? `<Zip4>${request.fromAddress.zip4}</Zip4>` : ''}
    </FromAddress>
    <ServiceType>${request.serviceType}</ServiceType>
    <Weight>${request.weight}</Weight>
    ${request.returnReceipt ? '<ReturnReceipt>true</ReturnReceipt>' : ''}
    ${request.signatureConfirmation ? '<SignatureConfirmation>true</SignatureConfirmation>' : ''}
    ${request.insurance ? `<Insurance>${request.insurance}</Insurance>` : ''}
  </LabelRequest>
</ClickNConfirmRequest>`
  }

  private parseAddressValidationResponse(xmlText: string): USPSAddressValidation {
    // This is a simplified parser - in production, use a proper XML parser
    try {
      const isValid = !xmlText.includes('<Error>')
      
      if (!isValid) {
        const errorMatch = xmlText.match(/<Description>(.*?)<\/Description>/)
        return {
          isValid: false,
          errorMessage: errorMatch ? errorMatch[1] : 'Address validation failed'
        }
      }

      // Extract standardized address
      const address1Match = xmlText.match(/<Address1>(.*?)<\/Address1>/)
      const address2Match = xmlText.match(/<Address2>(.*?)<\/Address2>/)
      const cityMatch = xmlText.match(/<City>(.*?)<\/City>/)
      const stateMatch = xmlText.match(/<State>(.*?)<\/State>/)
      const zip5Match = xmlText.match(/<Zip5>(.*?)<\/Zip5>/)
      const zip4Match = xmlText.match(/<Zip4>(.*?)<\/Zip4>/)

      return {
        isValid: true,
        standardizedAddress: {
          address1: address1Match ? address1Match[1] : '',
          address2: address2Match ? address2Match[1] : undefined,
          city: cityMatch ? cityMatch[1] : '',
          state: stateMatch ? stateMatch[1] : '',
          zip5: zip5Match ? zip5Match[1] : '',
          zip4: zip4Match ? zip4Match[1] : undefined
        }
      }
    } catch (error) {
      return {
        isValid: false,
        errorMessage: 'Failed to parse address validation response'
      }
    }
  }

  private parseTrackingResponse(xmlText: string): USPSTrackingInfo {
    // This is a simplified parser - in production, use a proper XML parser
    try {
      const statusMatch = xmlText.match(/<Status>(.*?)<\/Status>/)
      const events = []
      
      // Parse tracking events (simplified)
      const eventMatches = xmlText.match(/<TrackDetail>(.*?)<\/TrackDetail>/g)
      if (eventMatches) {
        eventMatches.forEach(match => {
          const eventMatch = match.match(/<TrackDetail>(.*?)<\/TrackDetail>/)
          if (eventMatch) {
            events.push({
              event: eventMatch[1],
              timestamp: new Date().toISOString(),
              location: 'USPS Facility',
              details: eventMatch[1]
            })
          }
        })
      }

      return {
        trackingNumber: 'mock-tracking',
        status: statusMatch ? statusMatch[1] : 'in_transit',
        events,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    } catch (error) {
      return {
        trackingNumber: 'mock-tracking',
        status: 'error',
        events: [],
        errorMessage: 'Failed to parse tracking response'
      }
    }
  }

  private parseRateResponse(xmlText: string): USPSRateResponse[] {
    // This is a simplified parser - in production, use a proper XML parser
    try {
      const rates: USPSRateResponse[] = []
      
      // Parse rates (simplified)
      const rateMatches = xmlText.match(/<Postage>(.*?)<\/Postage>/g)
      if (rateMatches) {
        rateMatches.forEach(match => {
          const serviceMatch = match.match(/<MailService>(.*?)<\/MailService>/)
          const costMatch = match.match(/<Rate>(.*?)<\/Rate>/)
          
          if (serviceMatch && costMatch) {
            rates.push({
              serviceType: serviceMatch[1],
              cost: parseFloat(costMatch[1]),
              deliveryTime: 3,
              trackingIncluded: true,
              signatureRequired: false,
              insuranceIncluded: 0
            })
          }
        })
      }

      return rates
    } catch (error) {
      return []
    }
  }

  private parseLabelResponse(xmlText: string): USPSLabelResponse {
    // This is a simplified parser - in production, use a proper XML parser
    try {
      const trackingMatch = xmlText.match(/<TrackingNumber>(.*?)<\/TrackingNumber>/)
      const costMatch = xmlText.match(/<Postage>(.*?)<\/Postage>/)
      
      return {
        trackingNumber: trackingMatch ? trackingMatch[1] : 'mock-tracking',
        labelUrl: 'mock-label-url',
        cost: costMatch ? parseFloat(costMatch[1]) : 3.75,
        serviceType: 'certified',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    } catch (error) {
      throw new Error('Failed to parse label response')
    }
  }

  // Mock methods for development/testing

  private mockAddressValidation(address: USPSAddress): USPSAddressValidation {
    return {
      isValid: true,
      standardizedAddress: {
        ...address,
        zip5: address.zip5 || '12345'
      }
    }
  }

  private mockTrackingInfo(trackingNumber: string): USPSTrackingInfo {
    return {
      trackingNumber,
      status: 'in_transit',
      events: [
        {
          event: 'Package accepted',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'USPS Facility',
          details: 'Package accepted for processing'
        },
        {
          event: 'In transit',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Sorting Facility',
          details: 'Package is in transit to destination'
        }
      ],
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  }

  private mockRates(request: USPSRateRequest): USPSRateResponse[] {
    const baseRates: Record<string, number> = {
      'certified': 3.75,
      'certified_return_receipt': 6.50,
      'registered': 15.75,
      'priority_express': 28.95,
      'priority': 8.95,
      'first_class': 0.60
    }

    return request.serviceTypes.map(serviceType => ({
      serviceType,
      cost: baseRates[serviceType] || 3.75,
      deliveryTime: serviceType.includes('express') ? 1 : serviceType.includes('priority') ? 2 : 3,
      trackingIncluded: true,
      signatureRequired: serviceType.includes('return_receipt') || serviceType.includes('registered'),
      insuranceIncluded: serviceType.includes('registered') ? 50 : serviceType.includes('express') ? 100 : 0
    }))
  }

  private mockLabelResponse(request: USPSLabelRequest): USPSLabelResponse {
    return {
      trackingNumber: `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      labelUrl: `https://mock-labels.com/label-${Date.now()}.pdf`,
      cost: 3.75,
      serviceType: request.serviceType,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  }
}

// Export singleton instance
export const uspsApi = new USPSAPIService()

// Export types
export type {
  USPSAddress,
  USPSAddressValidation,
  USPSTrackingEvent,
  USPSTrackingInfo,
  USPSLabelRequest,
  USPSLabelResponse,
  USPSRateRequest,
  USPSRateResponse
}

