import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
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
        
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Refund and Cancellation Policy</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Upon completing a Transaction, you are entering into a legally binding and enforceable agreement with us to purchase the product and/or service. After this point the User may cancel the Transaction unless it has been specifically provided for on the Platform. In which case, the cancellation will be subject to the terms mentioned on the Platform.
          </p>

          <p className="text-gray-700 leading-relaxed">
            We shall retain the discretion in approving any cancellation requests and we may ask for additional details before approving any requests.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Refund Eligibility</h2>
          <p className="text-gray-700 leading-relaxed">
            Once you have received the product and/or service, the only event where you can request for a replacement or a return and a refund is if the product and/or service does not match the description as mentioned on the Platform.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Refund Request Timeline</h2>
          <p className="text-gray-700 leading-relaxed">
            Any request for refund must be submitted within <strong>three days</strong> from the date of the Transaction or such number of days prescribed on the Platform, which shall in no event be less than three days.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How to Request a Refund</h2>
          <p className="text-gray-700 leading-relaxed">
            A User may submit a claim for a refund for a purchase made by raising a ticket or contacting us at{' '}
            <a 
              href="mailto:seller+63cfb8211bdb4057b910ce87fa90c619@instamojo.com" 
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              seller+63cfb8211bdb4057b910ce87fa90c619@instamojo.com
            </a>{' '}
            and providing:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>A clear and specific reason for the refund request</li>
            <li>The exact terms that have been violated</li>
            <li>Any proof, if required</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Refund Decision</h2>
          <p className="text-gray-700 leading-relaxed">
            Whether a refund will be provided will be determined by us, and we may ask for additional details before approving any requests.
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
