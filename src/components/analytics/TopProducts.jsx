import React from 'react';
import { BarChart } from 'lucide-react';

const TopProducts = ({ products }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Products</h2>
        <BarChart className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.sales} sales</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${product.revenue.toFixed(2)}</p>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(product.revenue / Math.max(...products.map(p => p.revenue))) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts; 