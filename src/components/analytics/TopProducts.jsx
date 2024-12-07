import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { TrendingUp, TrendingDown } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const TopProducts = ({ dateRange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('revenue'); // revenue, sales, growth

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getTopProducts(dateRange);
        setProducts(data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (dateRange?.from && dateRange?.to) {
      fetchProducts();
    }
  }, [dateRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!products?.length) return <div>No top products data available</div>;

  const sortedProducts = [...products].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Top Products</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="revenue">By Revenue</option>
          <option value="sales">By Sales</option>
          <option value="growth">By Growth</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {sortedProducts.map((product, index) => (
          <div key={index} className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {product.sales} sales • ${product.revenue.toLocaleString()}
                </p>
              </div>
              <div className={`flex items-center ${
                product.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.growth >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(product.growth)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts; 