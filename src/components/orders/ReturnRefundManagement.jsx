import React, { useState } from 'react';
import { format } from 'date-fns';
import Table from '../common/Table';
import ReturnRefundModal from './ReturnRefundModal';
import { toast } from 'react-hot-toast';

const ReturnRefundManagement = ({ requests, onUpdateRequest }) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleReviewClick = (request) => {
        if (!request) {
            toast.error('No request data available');
            return;
        }
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleAction = async (request, action, comment) => {
        try {
            await onUpdateRequest(request._id, {
                status: action,
                adminComments: comment
            });
            setIsModalOpen(false);
            setSelectedRequest(null);
            toast.success(`Return request ${action} successfully`);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const columns = React.useMemo(
        () => [
            {
                Header: 'Order ID',
                accessor: 'orderNumber',
                Cell: ({ value }) => value || 'N/A'
            },
            {
                Header: 'Customer',
                accessor: row => row.customer?.name,
                id: 'customerName',
                Cell: ({ value }) => value || 'N/A'
            },
            {
                Header: 'Type',
                accessor: row => row.returnRequest?.reason,
                id: 'returnType',
                Cell: ({ value }) => value || 'N/A'
            },
            {
                Header: 'Status',
                accessor: row => row.returnRequest?.status,
                id: 'returnStatus',
                Cell: ({ value }) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${value === 'approved' ? 'bg-green-100 text-green-800' :
                        value === 'rejected' ? 'bg-red-100 text-red-800' :
                            value === 'escalated' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                        }`}>
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
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReviewClick(row.original);
                        }}
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded"
                    >
                        Review
                    </button>
                )
            }
        ],
        []
    );

    return (
        <div>
            <Table columns={columns} data={requests} />
            <ReturnRefundModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
                onAction={handleAction}
            />
        </div>
    );
};

export default ReturnRefundManagement; 