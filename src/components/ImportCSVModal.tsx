'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Papa from 'papaparse';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStocksImported: () => void;
}

export default function ImportCSVModal({ isOpen, onClose, onStocksImported }: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const stocks = result.data as { symbol: string; quantity: string; avgPrice: string }[];
        try {
          for (const stock of stocks) {
            const { symbol, quantity, avgPrice } = stock;
            if (!symbol || !quantity || !avgPrice) continue;

            // Fetch/create stock
            const stockResponse = await fetch(`/api/stocks/${symbol}`);
            const stockData = await stockResponse.json();
            if (!stockResponse.ok) continue;

            // Add to portfolio
            await fetch('/api/portfolio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                stockId: stockData.id,
                quantity: parseFloat(quantity),
                avgPurchasePrice: parseFloat(avgPrice),
                notes: '',
              }),
            });
          }
          onStocksImported();
          onClose();
        } catch (error) {
          console.error('Error importing stocks:', error);
          alert('Failed to import some stocks. Please check the CSV format.');
        } finally {
          setIsLoading(false);
          setFile(null);
        }
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Stocks from CSV</DialogTitle>
          <Button variant="ghost" onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with columns: <code>symbol,quantity,avgPrice</code>
          </p>
          <Input type="file" accept=".csv" onChange={handleFileChange} />
          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}