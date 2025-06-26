'use client';

import { useState } from 'react';
import { Plus, PieChart, Upload } from 'lucide-react';
import AddStockModal from '@/components/AddStockModal';
import ImportCSVModal from '@/components/ImportCSVModal';
import PortfolioTable from '@/components/PortfolioTable1';
import { SideBar } from '@/components/SideBar';
import { Button } from '@/components/ui/button';

export default function PortfolioPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStockAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <PieChart className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Stock Portfolio</h1>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Stock
                </Button>
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Import CSV
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Portfolio</h2>
            <p className="text-gray-600">Track your stock investments and performance</p>
          </div>

          <PortfolioTable refreshTrigger={refreshTrigger} />
        </main>

        {/* Modals */}
        <AddStockModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onStockAdded={handleStockAdded}
        />
        <ImportCSVModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onStocksImported={handleStockAdded}
        />
      </div>
    </div>
  );
}