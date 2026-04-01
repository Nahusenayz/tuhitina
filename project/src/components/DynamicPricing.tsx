import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { pricingDb, guestDb } from '../lib/db';
import type { PricingHistory } from '../types';

interface DynamicPricingProps {
  propertyId: string;
}

export default function DynamicPricing({ propertyId }: DynamicPricingProps) {
  const [basePriceUSD, setBasePriceUSD] = useState<number>(100);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [finalPriceETB, setFinalPriceETB] = useState<number>(0);
  const [occupancyRate, setOccupancyRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastPricing, setLastPricing] = useState<PricingHistory | null>(null);

  useEffect(() => {
    loadLastPricing();
    calculateOccupancy();
  }, [propertyId]);

  useEffect(() => {
    if (exchangeRate > 0) {
      const price = basePriceUSD * exchangeRate * demandMultiplier;
      setFinalPriceETB(Math.round(price * 100) / 100);
    }
  }, [basePriceUSD, exchangeRate, demandMultiplier]);

  const loadLastPricing = async () => {
    try {
      const pricing = await pricingDb.getLatest(propertyId);
      setLastPricing(pricing);
      if (pricing) {
        setBasePriceUSD(pricing.base_price_usd);
        setExchangeRate(pricing.exchange_rate);
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
    }
  };

  const calculateOccupancy = async () => {
    try {
      const guests = await guestDb.getAll(propertyId);
      const checkedIn = guests.filter((g) => g.status === 'checked_in').length;
      const totalRooms = 50;
      const rate = (checkedIn / totalRooms) * 100;
      setOccupancyRate(Math.round(rate));

      if (rate > 70) {
        setDemandMultiplier(1.1);
      } else if (rate > 50) {
        setDemandMultiplier(1.05);
      } else {
        setDemandMultiplier(1.0);
      }
    } catch (error) {
      console.error('Error calculating occupancy:', error);
    }
  };

  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      if (data.rates && data.rates.ETB) {
        setExchangeRate(data.rates.ETB);
      } else {
        setExchangeRate(57.5);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setExchangeRate(57.5);
    } finally {
      setLoading(false);
    }
  };

  const savePricing = async () => {
    if (exchangeRate === 0) {
      alert('Please fetch exchange rate first');
      return;
    }

    try {
      await pricingDb.create({
        property_id: propertyId,
        base_price_usd: basePriceUSD,
        exchange_rate: exchangeRate,
        demand_multiplier: demandMultiplier,
        final_price_etb: finalPriceETB,
        occupancy_rate: occupancyRate,
      });

      alert('Pricing saved successfully!');
      loadLastPricing();
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Dynamic Pricing</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-1">Occupancy Rate</p>
          <p className="text-3xl font-bold text-blue-600">{occupancyRate}%</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 mb-1">Demand Multiplier</p>
          <p className="text-3xl font-bold text-green-600">{demandMultiplier}x</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-700 mb-1">Final Price (ETB)</p>
          <p className="text-3xl font-bold text-purple-600">{finalPriceETB.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price (USD)
          </label>
          <input
            type="number"
            value={basePriceUSD}
            onChange={(e) => setBasePriceUSD(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exchange Rate (USD to ETB)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={fetchExchangeRate}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Fetch Rate
            </button>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-3">Pricing Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price:</span>
            <span className="font-medium">${basePriceUSD} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Exchange Rate:</span>
            <span className="font-medium">{exchangeRate} ETB/USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Demand Adjustment:</span>
            <span className="font-medium">{((demandMultiplier - 1) * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-800 font-semibold">Recommended Price:</span>
            <span className="text-lg font-bold text-blue-600">{finalPriceETB.toFixed(2)} ETB</span>
          </div>
        </div>
      </div>

      <button
        onClick={savePricing}
        className="w-full mt-6 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        Save Pricing
      </button>

      {lastPricing && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            Last saved: {new Date(lastPricing.created_at).toLocaleString()} - {lastPricing.final_price_etb.toFixed(2)} ETB
          </p>
        </div>
      )}
    </div>
  );
}
