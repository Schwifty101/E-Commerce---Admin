import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, 
    Loader2, 
    AlertCircle,
    ArrowDown,
    Download
} from 'lucide-react';

const TopProducts = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('30days');
    const [sortBy, setSortBy] = useState('revenue');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getTopProducts({
                    period,
                    sortBy,
                    limit: 10
                });
                setData(response);
            } catch (error) {
                console.error('Error fetching top products:', error);
                toast.error('Failed to load top products data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period, sortBy]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading top products...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Top Products</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Best performing products for the selected period
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full appearance-none px-3 py-2 bg-white border rounded-lg 
                                text-sm text-gray-600 font-medium
                                focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                                hover:border-blue-300 transition-colors duration-200"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                        <ArrowDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full appearance-none px-3 py-2 bg-white border rounded-lg 
                                text-sm text-gray-600 font-medium
                                focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                                hover:border-blue-300 transition-colors duration-200"
                        >
                            <option value="revenue">Sort by Revenue</option>
                            <option value="sales">Sort by Sales</option>
                        </select>
                        <ArrowDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => {/* Handle export */}}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                hover:bg-blue-100 transition-all duration-200 inline-flex items-center 
                                justify-center space-x-2 active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-3 py-3 md:px-6 md:py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Sales
                                </th>
                                <th className="px-3 py-3 md:px-6 md:py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.products.map((product, index) => (
                                <motion.tr
                                    key={product.productId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 md:h-12 md:w-12">
                                                <img
                                                    className="h-full w-full rounded-lg object-cover shadow-sm"
                                                    src={product.image}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="ml-3 md:ml-4">
                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-gray-500 md:hidden">
                                                    {product.category}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.category}</div>
                                    </td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                        {product.stats.totalSales.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        ${product.stats.totalRevenue.toLocaleString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!data?.products || data.products.length === 0) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <AlertCircle className="w-8 h-8 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">
                            No products data available for the selected period
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default TopProducts;
