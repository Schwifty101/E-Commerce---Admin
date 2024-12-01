import React from 'react';
import { User } from '../../types';

interface SellerVerificationProps {
  seller: User;
  onApprove: (sellerId: string) => void;
  onReject: (sellerId: string) => void;
}

const SellerVerification: React.FC<SellerVerificationProps> = ({
  seller,
  onApprove,
  onReject,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">Seller Verification</h3>
      <div className="mt-4 space-y-4">
        <div>
          <h4 className="font-medium">Business Information</h4>
          <dl className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Company Name</dt>
              <dd className="text-sm text-gray-900">{seller.businessDetails?.companyName}</dd>
            </div>
            {/* Add other business details */}
          </dl>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onReject(seller.id)}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(seller.id)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerVerification;
