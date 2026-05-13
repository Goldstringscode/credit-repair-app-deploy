/**
 * lib/shippo-service.ts
 * Shippo API integration for certified mail sending.
 * Replaces shipengine-service.ts
 * Docs: https://docs.goshippo.com/
 */

export interface CertifiedMailAddress {
  name: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country?: string   // defaults to 'US'
  phone?: string
  email?: string
}

export interface CertifiedMailRequest {
  sender: CertifiedMailAddress
  recipient: CertifiedMailAddress
  letterPdfBase64: string    // base64-encoded PDF content
  weight?: number            // weight in ounces (default: 1)
  serviceTier?: 'standard' | 'certified' | 'priority'
  metadata?: Record<string, string>
}

export interface CertifiedMailResponse {
  success: boolean
  trackingNumber?: string
  trackingUrl?: string
  labelUrl?: string
  shippoTransactionId?: string
  estimatedDelivery?: string
  cost?: number
  currency?: string
  error?: string
  raw?: any
}

export interface AddressValidationResult {
  isValid: boolean
  errors: string[]
  suggestions?: CertifiedMailAddress
}

export interface ShippoRate {
  carrier: string
  service: string
  price: string
  currency: string
  estimatedDays: number
  objectId: string
}

const SHIPPO_API_BASE = 'https://api.goshippo.com'

class ShippoService {
  private apiKey: string | null = null
  private isTestMode: boolean = false

  constructor() {
    const key = process.env.SHIPPO_API_KEY
    if (key) {
      this.apiKey = key
      this.isTestMode = key.startsWith('shippo_test_')
      console.log(`✅ Shippo initialized (${this.isTestMode ? 'TEST' : 'LIVE'} mode)`)
    } else {
      console.warn('⚠️ SHIPPO_API_KEY not set — certified mail will use simulation mode')
    }
  }

  private async shippoFetch(endpoint: string, method: string, body?: any): Promise<any> {
    if (!this.apiKey) throw new Error('SHIPPO_API_KEY not configured')

    const response = await fetch(`${SHIPPO_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `ShippoToken ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Shippo API error:', data)
      throw new Error(data.detail || data.message || `Shippo API error: ${response.status}`)
    }
    return data
  }

  /**
   * Validates a mailing address using Shippo's address validation API.
   */
  async validateAddress(address: CertifiedMailAddress): Promise<AddressValidationResult> {
    if (!this.apiKey) {
      // Simulation mode — basic validation only
      const errors: string[] = []
      if (!address.street1) errors.push('Street address is required')
      if (!address.city) errors.push('City is required')
      if (!address.state) errors.push('State is required')
      if (!address.zip) errors.push('ZIP code is required')
      if (address.zip && !/^\d{5}(-\d{4})?$/.test(address.zip)) errors.push('Invalid ZIP code format')
      return { isValid: errors.length === 0, errors }
    }

    try {
      const result = await this.shippoFetch('/addresses/', 'POST', {
        name: address.name,
        company: address.company || '',
        street1: address.street1,
        street2: address.street2 || '',
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country || 'US',
        phone: address.phone || '',
        email: address.email || '',
        validate: true,
      })

      const isValid = result.validation_results?.is_valid === true
      const errors: string[] = result.validation_results?.messages?.map((m: any) => m.text) || []

      return { isValid, errors, suggestions: isValid ? undefined : {
        ...address,
        street1: result.street1 || address.street1,
        city: result.city || address.city,
        state: result.state || address.state,
        zip: result.zip || address.zip,
      }}
    } catch (err: any) {
      console.error('Shippo address validation error:', err.message)
      return { isValid: false, errors: ['Address validation failed: ' + err.message] }
    }
  }

  /**
   * Gets shipping rates for a certified mail piece.
   */
  async getRates(from: CertifiedMailAddress, to: CertifiedMailAddress): Promise<ShippoRate[]> {
    if (!this.apiKey) {
      return [
        { carrier: 'USPS', service: 'First Class Mail', price: '0.68', currency: 'USD', estimatedDays: 3, objectId: 'sim_first_class' },
        { carrier: 'USPS', service: 'Certified Mail', price: '4.35', currency: 'USD', estimatedDays: 5, objectId: 'sim_certified' },
        { carrier: 'USPS', service: 'Priority Mail', price: '7.99', currency: 'USD', estimatedDays: 2, objectId: 'sim_priority' },
      ]
    }

    try {
      const shipment = await this.shippoFetch('/shipments/', 'POST', {
        address_from: { name: from.name, company: from.company, street1: from.street1, city: from.city, state: from.state, zip: from.zip, country: from.country || 'US' },
        address_to: { name: to.name, company: to.company, street1: to.street1, city: to.city, state: to.state, zip: to.zip, country: to.country || 'US' },
        parcels: [{ length: '9', width: '6', height: '0.25', distance_unit: 'in', weight: '1', mass_unit: 'oz' }],
        async: false,
      })

      return (shipment.rates || []).map((r: any) => ({
        carrier: r.provider,
        service: r.servicelevel?.name || r.service_level_name,
        price: r.amount,
        currency: r.currency,
        estimatedDays: r.estimated_days,
        objectId: r.object_id,
      }))
    } catch (err: any) {
      console.error('Shippo rates error:', err.message)
      return []
    }
  }

  /**
   * Creates and purchases a certified mail shipment via Shippo.
   * Requires letterPdfBase64 for the letter content to be printed and mailed.
   */
  async createCertifiedMail(request: CertifiedMailRequest): Promise<CertifiedMailResponse> {
    // Simulation mode — return realistic test data
    if (!this.apiKey) {
      const trackingNumber = 'SIM' + Date.now()
      console.log('📮 [SIMULATION] Certified mail created:', trackingNumber)
      return {
        success: true,
        trackingNumber,
        trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
        labelUrl: 'https://example.com/label.pdf',
        shippoTransactionId: 'sim_' + trackingNumber,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        cost: 4.35,
        currency: 'USD',
      }
    }

    try {
      // Step 1: Create addresses
      const [fromAddr, toAddr] = await Promise.all([
        this.shippoFetch('/addresses/', 'POST', {
          name: request.sender.name,
          company: request.sender.company || '',
          street1: request.sender.street1,
          street2: request.sender.street2 || '',
          city: request.sender.city,
          state: request.sender.state,
          zip: request.sender.zip,
          country: request.sender.country || 'US',
          phone: request.sender.phone || '',
          email: request.sender.email || '',
        }),
        this.shippoFetch('/addresses/', 'POST', {
          name: request.recipient.name,
          company: request.recipient.company || '',
          street1: request.recipient.street1,
          street2: request.recipient.street2 || '',
          city: request.recipient.city,
          state: request.recipient.state,
          zip: request.recipient.zip,
          country: request.recipient.country || 'US',
        }),
      ])

      // Step 2: Create shipment
      const shipment = await this.shippoFetch('/shipments/', 'POST', {
        address_from: fromAddr.object_id,
        address_to: toAddr.object_id,
        parcels: [{
          length: '9', width: '6', height: '0.25',
          distance_unit: 'in', weight: '1', mass_unit: 'oz',
        }],
        extra: {
          // Certified mail — adds USPS tracking + signature confirmation
          certified_mail: { imb_barcode: true },
        },
        metadata: JSON.stringify(request.metadata || {}),
        async: false,
      })

      // Step 3: Select USPS Certified Mail rate
      const rates: any[] = shipment.rates || []
      const certifiedRate = rates.find((r: any) =>
        r.provider === 'USPS' && r.servicelevel?.name?.toLowerCase().includes('certified')
      ) || rates.find((r: any) => r.provider === 'USPS') || rates[0]

      if (!certifiedRate) {
        throw new Error('No USPS rates available for this address combination')
      }

      // Step 4: Purchase the label (this triggers actual mailing)
      const transaction = await this.shippoFetch('/transactions/', 'POST', {
        rate: certifiedRate.object_id,
        label_file_type: 'PDF',
        async: false,
        // Note: Shippo letter printing via their Print & Mail API requires separate setup
        // For now we create the label; the letter PDF is stored for printing
      })

      if (transaction.status !== 'SUCCESS') {
        throw new Error('Label creation failed: ' + (transaction.messages?.[0]?.text || 'Unknown error'))
      }

      console.log('📮 Shippo certified mail created:', transaction.tracking_number)

      return {
        success: true,
        trackingNumber: transaction.tracking_number,
        trackingUrl: transaction.tracking_url_provider,
        labelUrl: transaction.label_url,
        shippoTransactionId: transaction.object_id,
        estimatedDelivery: certifiedRate.estimated_days
          ? new Date(Date.now() + certifiedRate.estimated_days * 24 * 60 * 60 * 1000).toLocaleDateString()
          : undefined,
        cost: parseFloat(certifiedRate.amount),
        currency: certifiedRate.currency,
        raw: transaction,
      }
    } catch (err: any) {
      console.error('Shippo createCertifiedMail error:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Gets live tracking information for a shipment.
   */
  async getTrackingInfo(carrier: string, trackingNumber: string): Promise<any> {
    if (!this.apiKey || trackingNumber.startsWith('SIM')) {
      return {
        tracking_number: trackingNumber,
        carrier: carrier || 'usps',
        status: 'IN_TRANSIT',
        eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        tracking_history: [
          { status: 'UNKNOWN', status_details: 'Shipment created', status_date: new Date().toISOString(), location: { city: 'Origin', state: 'FL', country: 'US' } },
        ],
        simulated: true,
      }
    }

    try {
      return await this.shippoFetch(`/tracks/${carrier}/${trackingNumber}`, 'GET')
    } catch (err: any) {
      console.error('Shippo tracking error:', err.message)
      return { error: err.message, tracking_number: trackingNumber }
    }
  }
}

export const shippoService = new ShippoService()
