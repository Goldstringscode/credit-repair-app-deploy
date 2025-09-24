'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  MapPin,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

interface TrackingEvent {
  event: string;
  timestamp: string;
  location: string;
  details: string;
  source: string;
}

interface TrackingStatusCardProps {
  trackingNumber: string;
  initialStatus: string;
  initialEvents: TrackingEvent[];
  onRefresh?: () => void;
}

export default function TrackingStatusCard({
  trackingNumber,
  initialStatus,
  initialEvents,
  onRefresh,
}: TrackingStatusCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [events, setEvents] = useState(initialEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'exception':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
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
      case 'exception':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Your letter is being processed and will be picked up soon';
      case 'in_transit':
        return 'Your letter is on its way to the recipient';
      case 'delivered':
        return 'Your letter has been successfully delivered';
      case 'failed':
      case 'exception':
        return 'There was an issue with your letter delivery';
      default:
        return 'Tracking information is being updated';
    }
  };

  const refreshTracking = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/certified-mail/track/${trackingNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.data.status);
        setEvents(data.data.events || events);
        setLastUpdated(new Date());
        toast.success('Tracking information updated');
      } else {
        throw new Error('Failed to refresh tracking');
      }
    } catch (error) {
      console.error('Error refreshing tracking:', error);
      toast.error('Failed to refresh tracking information');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCurrentLocation = () => {
    const inTransitEvent = events.find(event => 
      event.event === 'in_transit' || 
      event.event === 'out_for_delivery' ||
      event.event === 'picked_up'
    );
    return inTransitEvent?.location || 'Unknown';
  };

  const getLatestEvent = () => {
    return events.length > 0 ? events[0] : null;
  };

  const latestEvent = getLatestEvent();
  const currentLocation = getCurrentLocation();

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(status)}
            <div>
              <h3 className="font-semibold text-lg">Tracking Status</h3>
              <p className="text-sm text-gray-600">#{trackingNumber}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTracking}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="mb-4">
          <Badge className={`${getStatusColor(status)} text-sm px-3 py-1`}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
          <p className="text-sm text-gray-600 mt-2">
            {getStatusMessage(status)}
          </p>
        </div>

        {status === 'in_transit' && currentLocation && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Current Location: {currentLocation}
              </span>
            </div>
          </div>
        )}

        {latestEvent && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Latest Update</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <strong>{latestEvent.event.replace('_', ' ').toUpperCase()}</strong>
              </p>
              <p className="text-sm text-gray-600">{latestEvent.details}</p>
              {latestEvent.location && (
                <p className="text-sm text-gray-500">
                  📍 {latestEvent.location}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {new Date(latestEvent.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
