import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Shipping and Delivery</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Delivery Estimates</h2>
          <p className="text-gray-700 leading-relaxed">
            You hereby agree that the delivery dates are estimates, unless a fixed date for the delivery has been expressly agreed in writing.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Shipping Costs</h2>
          <p className="text-gray-700 leading-relaxed">
            The cost for delivery shall be calculated at the time of initiation of Transaction based on the shipping address and will be collected from you as a part of the Transaction Amount paid for the products and/or services.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Delayed Delivery</h2>
          <p className="text-gray-700 leading-relaxed">
            In the event that you do not receive the delivery even after <strong>seven days</strong> have passed from the estimated date of delivery, you must promptly reach out to us at{' '}
            <a 
              href="mailto:seller+63cfb8211bdb4057b910ce87fa90c619@instamojo.com" 
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              seller+63cfb8211bdb4057b910ce87fa90c619@instamojo.com
            </a>
          </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
