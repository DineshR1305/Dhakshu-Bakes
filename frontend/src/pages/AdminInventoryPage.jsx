import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Save } from 'lucide-react';
import api from '../services/api';

export default function AdminInventoryPage() {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      const res = await api.get('/admin/inventory');
      if (res.success) setInventoryList(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleStockChange = (id, newQuantity) => {
    setInventoryList(inventoryList.map(inv => inv.id === id ? { ...inv, stockQuantity: Number(newQuantity) } : inv));
  };

  const handleSaveStock = async (variantId, stockQuantity) => {
    try {
      const res = await api.put(`/admin/inventory/${variantId}`, { stockQuantity });
      if (res.success) {
        alert('Stock updated successfully');
        loadInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">INVENTORY & STOCK CONTROL</h1>
        <p className="text-xs text-gray-500">Monitor product stock levels, low-stock thresholds, and out-of-stock statuses.</p>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/60 text-bakery-dark uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Variant ID</th>
                <th className="p-3">Stock Quantity</th>
                <th className="p-3">Low Stock Threshold</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {inventoryList.map((inv) => (
                <tr key={inv.id} className="hover:bg-cream-50">
                  <td className="p-3 font-bold text-bakery-dark">Variant #{inv.id}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={inv.stockQuantity}
                      onChange={(e) => handleStockChange(inv.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-cream-100 border border-cream-300 rounded font-bold text-xs"
                    />
                  </td>
                  <td className="p-3 text-gray-600">{inv.lowStockThreshold} units</td>
                  <td className="p-3">
                    {inv.stockQuantity <= inv.lowStockThreshold ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleSaveStock(inv.id, inv.stockQuantity)}
                      className="px-3 py-1 bg-bakery-dark text-white font-bold text-xs rounded-lg hover:bg-bakery flex items-center gap-1 ml-auto"
                    >
                      <Save className="w-3 h-3" /> Save Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
