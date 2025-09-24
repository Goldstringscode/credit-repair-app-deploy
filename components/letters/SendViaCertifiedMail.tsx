'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Mail,
  Send,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Truck,
  FileText,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

interface SendViaCertifiedMailProps {
  letterContent: string;
  letterType: string;
  recipientName?: string;
  recipientAddress?: string;
  onSuccess?: (trackingNumber: string) => void;
}

interface MailData {
  recipient: {
    name: string;
    address: {
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  sender: {
    name: string;
    address: {
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  serviceTier: 'basic' | 'premium' | 'professional';
  additionalServices: {
    returnReceipt: boolean;
    signatureConfirmation: boolean;
    insurance: boolean;
  };
}

export default function SendViaCertifiedMail({
  letterContent,
  letterType,
  recipientName = '',
  recipientAddress = '',
  onSuccess,
}: SendViaCertifiedMailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [mailData, setMailData] = useState<MailData>({
    recipient: {
      name: recipientName,
      address: {
        address1: recipientAddress,
        city: '',
        state: '',
        zip: '',
        country: 'US',
      },
    },
    sender: {
      name: '',
      address: {
        address1: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      },
    },
    serviceTier: 'basic',
    additionalServices: {
      returnReceipt: false,
      signatureConfirmation: false,
      insurance: false,
    },
  });
  const [pricing, setPricing] = useState<any>(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState(false);

  const pricingTiers = {
    basic: {
      name: 'Basic Service',
      price: 5.50,
      description: 'Certified mail with tracking and basic templates',
      features: ['Certified mail tracking', 'Basic templates', 'Standard delivery'],
    },
    premium: {
      name: 'Premium Service',
      price: 7.50,
      description: 'Basic + return receipt + priority processing',
      features: ['Everything in Basic', 'Return receipt', 'Priority processing'],
    },
    professional: {
      name: 'Professional Service',
      price: 9.50,
      description: 'Premium + signature confirmation + insurance',
      features: ['Everything in Premium', 'Signature confirmation', 'Insurance coverage'],
    },
  };

  const calculateCost = async () => {
    setIsCalculatingCost(true);
    try {
      const response = await fetch('/api/certified-mail/calculate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTier: mailData.serviceTier,
          additionalServices: mailData.additionalServices,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPricing(data.data);
      }
    } catch (error) {
      console.error('Error calculating cost:', error);
    } finally {
      setIsCalculatingCost(false);
    }
  };

  const validateAddress = async (address: any) => {
    try {
      const response = await fetch('/api/certified-mail/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.isValid;
      }
      return false;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  };

  const handleSendMail = async () => {
    setIsLoading(true);
    try {
      // Validate addresses
      const recipientValid = await validateAddress(mailData.recipient.address);
      const senderValid = await validateAddress(mailData.sender.address);

      if (!recipientValid || !senderValid) {
        toast.error('Please check your addresses. One or more addresses are invalid.');
        return;
      }

      // Create mail request
      const response = await fetch('/api/certified-mail/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000', // This should come from auth
          recipient: mailData.recipient,
          sender: mailData.sender,
          letter: {
            subject: `${letterType} Letter`,
            content: letterContent,
            type: letterType,
          },
          serviceTier: mailData.serviceTier,
          additionalServices: mailData.additionalServices,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const trackingNumber = data.data.mail.trackingNumber;
        
        toast.success(`Letter sent successfully! Tracking number: ${trackingNumber}`);
        setIsOpen(false);
        onSuccess?.(trackingNumber);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send letter');
      }
    } catch (error) {
      console.error('Error sending mail:', error);
      toast.error('Failed to send letter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      calculateCost();
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipient-name">Recipient Name *</Label>
            <Input
              id="recipient-name"
              value={mailData.recipient.name}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  recipient: { ...mailData.recipient, name: e.target.value },
                })
              }
              placeholder="Credit Bureau Name"
            />
          </div>
          <div>
            <Label htmlFor="recipient-address">Address Line 1 *</Label>
            <Input
              id="recipient-address"
              value={mailData.recipient.address.address1}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  recipient: {
                    ...mailData.recipient,
                    address: { ...mailData.recipient.address, address1: e.target.value },
                  },
                })
              }
              placeholder="P.O. Box 4500"
            />
          </div>
          <div>
            <Label htmlFor="recipient-city">City *</Label>
            <Input
              id="recipient-city"
              value={mailData.recipient.address.city}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  recipient: {
                    ...mailData.recipient,
                    address: { ...mailData.recipient.address, city: e.target.value },
                  },
                })
              }
              placeholder="Allen"
            />
          </div>
          <div>
            <Label htmlFor="recipient-state">State *</Label>
            <Input
              id="recipient-state"
              value={mailData.recipient.address.state}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  recipient: {
                    ...mailData.recipient,
                    address: { ...mailData.recipient.address, state: e.target.value },
                  },
                })
              }
              placeholder="TX"
            />
          </div>
          <div>
            <Label htmlFor="recipient-zip">ZIP Code *</Label>
            <Input
              id="recipient-zip"
              value={mailData.recipient.address.zip}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  recipient: {
                    ...mailData.recipient,
                    address: { ...mailData.recipient.address, zip: e.target.value },
                  },
                })
              }
              placeholder="75013"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Information (Sender)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sender-name">Your Name *</Label>
            <Input
              id="sender-name"
              value={mailData.sender.name}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  sender: { ...mailData.sender, name: e.target.value },
                })
              }
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="sender-address">Your Address *</Label>
            <Input
              id="sender-address"
              value={mailData.sender.address.address1}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  sender: {
                    ...mailData.sender,
                    address: { ...mailData.sender.address, address1: e.target.value },
                  },
                })
              }
              placeholder="123 Main St"
            />
          </div>
          <div>
            <Label htmlFor="sender-city">City *</Label>
            <Input
              id="sender-city"
              value={mailData.sender.address.city}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  sender: {
                    ...mailData.sender,
                    address: { ...mailData.sender.address, city: e.target.value },
                  },
                })
              }
              placeholder="Your City"
            />
          </div>
          <div>
            <Label htmlFor="sender-state">State *</Label>
            <Input
              id="sender-state"
              value={mailData.sender.address.state}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  sender: {
                    ...mailData.sender,
                    address: { ...mailData.sender.address, state: e.target.value },
                  },
                })
              }
              placeholder="CA"
            />
          </div>
          <div>
            <Label htmlFor="sender-zip">ZIP Code *</Label>
            <Input
              id="sender-zip"
              value={mailData.sender.address.zip}
              onChange={(e) =>
                setMailData({
                  ...mailData,
                  sender: {
                    ...mailData.sender,
                    address: { ...mailData.sender.address, zip: e.target.value },
                  },
                })
              }
              placeholder="90210"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Service Options</h3>
        <div className="space-y-4">
          {Object.entries(pricingTiers).map(([key, tier]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                mailData.serviceTier === key
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() =>
                setMailData({ ...mailData, serviceTier: key as any })
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{tier.name}</h4>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                    <ul className="text-xs text-gray-500 mt-2">
                      {tier.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${tier.price}
                    </div>
                    <div className="text-sm text-gray-500">per letter</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="return-receipt"
              checked={mailData.additionalServices.returnReceipt}
              onCheckedChange={(checked) =>
                setMailData({
                  ...mailData,
                  additionalServices: {
                    ...mailData.additionalServices,
                    returnReceipt: checked as boolean,
                  },
                })
              }
            />
            <Label htmlFor="return-receipt">
              Return Receipt (+$2.75) - Proof of delivery
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="signature-confirmation"
              checked={mailData.additionalServices.signatureConfirmation}
              onCheckedChange={(checked) =>
                setMailData({
                  ...mailData,
                  additionalServices: {
                    ...mailData.additionalServices,
                    signatureConfirmation: checked as boolean,
                  },
                })
              }
            />
            <Label htmlFor="signature-confirmation">
              Signature Confirmation (+$3.50) - Signature required
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurance"
              checked={mailData.additionalServices.insurance}
              onCheckedChange={(checked) =>
                setMailData({
                  ...mailData,
                  additionalServices: {
                    ...mailData.additionalServices,
                    insurance: checked as boolean,
                  },
                })
              }
            />
            <Label htmlFor="insurance">
              Insurance (+$0.00) - Basic insurance included
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review & Send</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Letter Preview</h4>
          <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
            {letterContent.substring(0, 500)}
            {letterContent.length > 500 && '...'}
          </div>
        </div>
      </div>

      {pricing && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Cost:</span>
                  <span>${pricing.baseCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee:</span>
                  <span>${pricing.serviceFee}</span>
                </div>
                {pricing.additionalFees > 0 && (
                  <div className="flex justify-between">
                    <span>Additional Services:</span>
                    <span>${pricing.additionalFees}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${pricing.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">What happens next?</h4>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• Your letter will be printed and sent via certified mail</li>
              <li>• You'll receive a tracking number for monitoring</li>
              <li>• Delivery confirmation will be sent to your email</li>
              <li>• Typical delivery time: 2-3 business days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Mail className="w-4 h-4 mr-2" />
          Send via Certified Mail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Send Letter via Certified Mail</span>
          </DialogTitle>
          <DialogDescription>
            Send your {letterType} letter via certified mail with tracking and delivery confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of 3</span>
              <span>
                {currentStep === 1 && 'Address Information'}
                {currentStep === 2 && 'Service Selection'}
                {currentStep === 3 && 'Review & Send'}
              </span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </div>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <div className="space-x-2">
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSendMail}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Letter
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
