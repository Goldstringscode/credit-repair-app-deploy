'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              This application is currently in beta testing and is only available to trusted users.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Request Access
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                To request access to the beta version, please contact the administrator.
              </p>
              <Button asChild className="w-full">
                <a href="mailto:admin@yourdomain.com?subject=Beta Access Request&body=Hi, I would like to request access to the Credit Repair App beta version. Please let me know how to proceed.">
                  <Mail className="w-4 h-4 mr-2" />
                  Request Beta Access
                </a>
              </Button>
            </div>

            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              
              <p className="text-xs text-gray-500">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
