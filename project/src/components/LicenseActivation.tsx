import { useState, useEffect } from 'react';
import { Key, QrCode, CheckCircle, XCircle } from 'lucide-react';
import { licenseDb } from '../lib/db';
import type { LicenseActivation } from '../types';

interface LicenseActivationProps {
  propertyId: string;
}

export default function LicenseActivation({ propertyId }: LicenseActivationProps) {
  const [license, setLicense] = useState<LicenseActivation | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicense();
  }, [propertyId]);

  const loadLicense = async () => {
    setLoading(true);
    try {
      const existingLicense = await licenseDb.getByPropertyId(propertyId);
      setLicense(existingLicense);
    } catch (error) {
      console.error('Error loading license:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateActivationKey = (propertyId: string, expiryDate: string): string => {
    const secret = 'tihtina-secret-key-2024';
    const data = `${propertyId}-${expiryDate}-${secret}`;

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const key = Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
    return `TIHT-${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}-${key.slice(12, 16)}`;
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const activationKey = generateActivationKey(propertyId, expiryDate.toISOString());

      await licenseDb.create({
        property_id: propertyId,
        activation_key: activationKey,
        expiry_date: expiryDate.toISOString(),
        is_active: true,
      });

      await loadLicense();
      setShowPayment(false);
      alert('License activated successfully!');
    } catch (error) {
      console.error('Error activating license:', error);
      alert('Failed to activate license');
    } finally {
      setLoading(false);
    }
  };

  const isLicenseValid = () => {
    if (!license) return false;
    const expiryDate = new Date(license.expiry_date);
    return license.is_active && expiryDate > new Date();
  };

  const getDaysRemaining = () => {
    if (!license) return 0;
    const expiryDate = new Date(license.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && !license) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading license information...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Key className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">License Activation</h2>
      </div>

      {!license || !isLicenseValid() ? (
        <div>
          {showPayment ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <QrCode className="w-24 h-24 mx-auto text-blue-600 mb-4" />
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Scan to Pay with Telebirr
                </p>
                <p className="text-3xl font-bold text-blue-600 mb-4">5,000 ETB</p>
                <p className="text-sm text-gray-600">Annual License Fee</p>
              </div>

              <div className="text-center text-sm text-gray-600 mb-4">
                This is a mock payment interface. In production, this would integrate with Telebirr's API.
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Processing...' : 'Simulate Payment Complete'}
              </button>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-yellow-800">License Required</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {license
                      ? 'Your license has expired. Please renew to continue using TIHTINA-AI.'
                      : 'Activate your license to use all features of TIHTINA-AI.'}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">License Features:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Unlimited guest check-ins
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Guest preference tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Housekeeping management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Dynamic pricing tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Cloud sync capabilities
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Priority support
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-5 h-5" />
                Pay via Telebirr - 5,000 ETB/year
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-green-800">License Active</p>
              <p className="text-sm text-green-700 mt-1">
                Your license is valid and active. All features are available.
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Activation Key</p>
              <p className="text-lg font-mono font-semibold text-gray-800 break-all">
                {license.activation_key}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Activated On</p>
                <p className="font-medium text-gray-800">
                  {new Date(license.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expires On</p>
                <p className="font-medium text-gray-800">
                  {new Date(license.expiry_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className="text-3xl font-bold text-blue-600">{getDaysRemaining()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
