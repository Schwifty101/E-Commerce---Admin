import React, { useState } from 'react';
import { format } from 'date-fns';
import Table from '../common/Table';
import ReturnRefundModal from './ReturnRefundModal';
import { toast } from 'react-hot-toast';
import { Search, Filter, RefreshCw } from 'lucide-react';

const ReturnRefundManagement = ({ requests, onUpdateRequest, isLoading }) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const validRequests = requests.filter(request => 
        request.returnRequest && 
        Object.keys(request.returnRequest).length > 0 &&
        (!searchTerm || 
            request.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        (!statusFilter || request.returnRequest.status === statusFilter)
    );

    const handleReviewClick = (request) => {
        if (!request?.returnRequest) {
            toast.error('No return request data available');
            return;
        }
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleAction = async (request, action, comment) => {
        try {
            if (request.returnRequest.status === 'approved' || request.returnRequest.status === 'rejected') {
                toast.error(`Cannot modify a request that is already ${request.returnRequest.status}`);
                return;
            }

            await onUpdateRequest(request._id, {
                action,
                comments: comment
            });
            setIsModalOpen(false);
            setSelectedRequest(null);
            toast.success(`Return request ${action}ed successfully`);
        } catch (error) {
            toast.error(error.message || 'Failed to process return request');
        }
    };

    const columns = React.useMemo(
        () => [
            {
                Header: 'Order ID',
                accessor: 'orderNumber',
                Cell: ({ value }) => (
                    <span className="font-medium text-gray-900">#{value || 'N/A'}</span>
                )
            },
            {
                Header: 'Customer',
                accessor: row => row.customer?.name,
                id: 'customerName',
                Cell: ({ row, value }) => (
                    <div className="flex flex-col">
                        <span className="text-gray-900">{value || 'N/A'}</span>
                        <span className="text-xs text-gray-500">
                            {row.original.customer?.email || 'No email'}
                        </span>
                    </div>
                )
            },
            {
                Header: 'Type',
                accessor: row => row.returnRequest?.reason,
                id: 'returnType',
                Cell: ({ value }) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {value || 'N/A'}
                    </span>
                )
            },
            {
                Header: 'Status',
                accessor: row => row.returnRequest?.status,
                id: 'returnStatus',
                Cell: ({ value }) => (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${value === 'approved' ? 'bg-green-100 text-green-800' :
                        value === 'rejected' ? 'bg-red-100 text-red-800' :
                        value === 'escalated' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                        {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Pending'}
                    </span>
                )
            },
            {
                Header: 'Date',
                accessor: row => row.returnRequest?.requestedAt,
                id: 'requestDate',
                Cell: ({ value }) => value ? format(new Date(value), 'MMM d, yyyy') : 'N/A'
            },
            {
                Header: 'Actions',
                id: 'actions',
                Cell: ({ row }) => (
                    <button
                        onClick={() => handleReviewClick(row.original)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 
                            hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed 
                            transition-colors rounded-md"
                        disabled={row.original.returnRequest?.status === 'approved' || 
                                row.original.returnRequest?.status === 'rejected'}
                    >
                        Review
                    </button>
                )
            }
        ],
        []
    );

    return (
        <div className="space-y-4">
            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by order ID or customer..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                                    appearance-none bg-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="escalated">Escalated</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading requests...</span>
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        data={validRequests}
                        emptyMessage="No return requests found"
                    />
                )}
            </div>

            {/* Modal */}
            <ReturnRefundModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
                onAction={handleAction}
            />
        </div>
    );
};

export default ReturnRefundManagement; 