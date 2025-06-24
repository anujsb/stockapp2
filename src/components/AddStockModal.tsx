// src/components/AddStockModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import StockSearch from './StockSearch';
import { Button } from './ui/button';

interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
  matchScore: string;
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStockAdded: () => void;
}

export default function AddStockModal({ isOpen, onClose, onStockAdded }: AddStockModalProps) {
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setSelectedStock(null);
    setQuantity('');
    setAvgPrice('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !quantity || !avgPrice) return;

    setIsLoading(true);
    try {
      // First, fetch/create the stock
      const stockResponse = await fetch(`/api/stocks/${selectedStock.symbol}`);
      const stockData = await stockResponse.json();

      if (!stockResponse.ok) {
        throw new Error(stockData.error || 'Failed to fetch stock data');
      }

      // Then add to portfolio
      const portfolioResponse = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: stockData.id,
          quantity: parseFloat(quantity),
          avgPurchasePrice: parseFloat(avgPrice),
          notes,
        }),
      });

      if (!portfolioResponse.ok) {
        throw new Error('Failed to add stock to portfolio');
      }

      resetForm();
      onClose();
      onStockAdded();
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Failed to add stock to portfolio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Stock to Portfolio</h2>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Stock
            </label>
            <StockSearch
              onStockSelect={setSelectedStock}
              placeholder="Search for a stock..."
            />
            {selectedStock && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-900">{selectedStock.symbol}</div>
                <div className="text-sm text-blue-700">{selectedStock.name}</div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter quantity"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Purchase Price
            </label>
            <input
              type="number"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter average price"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Add any notes about this investment..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStock || !quantity || !avgPrice || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
