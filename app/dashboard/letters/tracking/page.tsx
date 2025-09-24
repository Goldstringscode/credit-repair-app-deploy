'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Eye,
  RefreshCw,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface LetterTracking {
  id: string;
  trackingNumber: string;
  letterType: string;
  recipient: string;
  status: 'processing' | 'in_transit' | 'delivered' | 'failed';
  sentDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  cost: number;
  serviceTier: string;
  events: Array<{
    event: string;
    timestamp: string;
    location: string;
    details: string;
  }>;
}

export default function LetterTrackingPage() {
  const [letters, setLetters] = useState<LetterTracking[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<LetterTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState<LetterTracking | null>(null);

  // Fetch real tracking data
  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      // In a real app, this would fetch from your API
      // For now, we'll use mock data but structure it for real API calls
      const mockLetters: LetterTracking[] = [
        {
          id: '1',
          trackingNumber: 'CR1758742567106MHDGOU',
          letterType: 'Dispute Letter',
          recipient: 'Experian',
          status: 'in_transit',
          sentDate: '2025-01-20',
          estimatedDelivery: '2025-01-23',
          cost: 8.25,
          serviceTier: 'Basic',
          events: [
            {
              event: 'Package accepted',
              timestamp: '2025-01-20T10:30:00Z',
              location: 'Los Angeles, CA',
              details: 'Package accepted for processing',
            },
            {
              event: 'In transit',
              timestamp: '2025-01-21T08:15:00Z',
              location: 'Phoenix, AZ',
              details: 'Package is in transit to destination',
            },
          ],
        },
        {
          id: '2',
          trackingNumber: 'CR1758742513102KJFJE0',
          letterType: 'Goodwill Letter',
          recipient: 'Equifax',
          status: 'delivered',
          sentDate: '2025-01-18',
          estimatedDelivery: '2025-01-21',
          actualDelivery: '2025-01-21',
          cost: 7.50,
          serviceTier: 'Premium',
          events: [
            {
              event: 'Package accepted',
              timestamp: '2025-01-18T14:20:00Z',
              location: 'Los Angeles, CA',
              details: 'Package accepted for processing',
            },
            {
              event: 'In transit',
              timestamp: '2025-01-19T09:45:00Z',
              location: 'Denver, CO',
              details: 'Package is in transit to destination',
            },
            {
              event: 'Delivered',
              timestamp: '2025-01-21T11:30:00Z',
              location: 'Atlanta, GA',
              details: 'Package delivered to recipient',
            },
          ],
        },
      ];

      setLetters(mockLetters);
      setFilteredLetters(mockLetters);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error('Failed to load tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = letters;

    if (searchTerm) {
      filtered = filtered.filter(
        (letter) =>
          letter.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          letter.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
          letter.letterType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((letter) => letter.status === statusFilter);
    }

    setFilteredLetters(filtered);
  }, [searchTerm, statusFilter, letters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_transit':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshTracking = async (trackingNumber: string) => {
    try {
      setIsLoading(true);
      
      // Call the real-time tracking API
      const response = await fetch(`/api/certified-mail/track/${trackingNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the specific letter in the list
        setLetters(prevLetters => 
          prevLetters.map(letter => 
            letter.trackingNumber === trackingNumber 
              ? {
                  ...letter,
                  status: data.data.status,
                  events: data.data.events || letter.events,
                  actualDelivery: data.data.timeline.actualDelivery
                }
              : letter
          )
        );
        
        toast.success('Tracking information refreshed');
      } else {
        throw new Error('Failed to refresh tracking');
      }
    } catch (error) {
      console.error('Error refreshing tracking:', error);
      toast.error('Failed to refresh tracking information');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadLetter = (letter: LetterTracking) => {
    // In a real app, this would download the letter PDF
    toast.success('Letter downloaded');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Letter Tracking</h1>
          <p className="text-gray-600">Track all your sent letters and their delivery status</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by tracking number, recipient, or letter type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Letters List */}
        <div className="space-y-4">
          {filteredLetters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No letters found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'You haven\'t sent any letters yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLetters.map((letter) => (
              <Card key={letter.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(letter.status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {letter.letterType}
                        </h3>
                        <Badge className={getStatusColor(letter.status)}>
                          {letter.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tracking Number:</span>
                          <p className="font-mono">{letter.trackingNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium">Recipient:</span>
                          <p>{letter.recipient}</p>
                        </div>
                        <div>
                          <span className="font-medium">Sent Date:</span>
                          <p>{new Date(letter.sentDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Service:</span>
                          <p>{letter.serviceTier} (${letter.cost})</p>
                        </div>
                      </div>

                      {letter.status === 'in_transit' && (
                        <div className="mt-3 text-sm text-blue-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Estimated delivery: {new Date(letter.estimatedDelivery).toLocaleDateString()}
                        </div>
                      )}

                      {letter.status === 'delivered' && letter.actualDelivery && (
                        <div className="mt-3 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Delivered on: {new Date(letter.actualDelivery).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLetter(letter)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshTracking(letter.trackingNumber)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadLetter(letter)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Letter Details Modal */}
        {selectedLetter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedLetter.status)}
                  Letter Details - {selectedLetter.trackingNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Letter Information</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Type:</span> {selectedLetter.letterType}</p>
                      <p><span className="font-medium">Recipient:</span> {selectedLetter.recipient}</p>
                      <p><span className="font-medium">Service Tier:</span> {selectedLetter.serviceTier}</p>
                      <p><span className="font-medium">Cost:</span> ${selectedLetter.cost}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Timeline</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Sent:</span> {new Date(selectedLetter.sentDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Estimated Delivery:</span> {new Date(selectedLetter.estimatedDelivery).toLocaleDateString()}</p>
                      {selectedLetter.actualDelivery && (
                        <p><span className="font-medium">Actual Delivery:</span> {new Date(selectedLetter.actualDelivery).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Tracking Events</h4>
                  <div className="space-y-3">
                    {selectedLetter.events.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{event.event}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{event.location}</p>
                          <p className="text-sm text-gray-500">{event.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedLetter(null)}>
                    Close
                  </Button>
                  <Button onClick={() => downloadLetter(selectedLetter)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Letter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
