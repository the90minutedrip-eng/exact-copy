import { ArrowLeft, Mail, Globe, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactUs() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <p className="text-gray-700 leading-relaxed mb-12">
          We're here to help. Reach out using the details below, and we'll get back to you as soon as possible.
        </p>

        <div className="space-y-8">
          {/* Email */}
          <div className="border-l-4 border-emerald-500 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Email</h2>
            </div>
            <a
              href="mailto:the90minutedrip@gmail.com"
              className="text-emerald-600 hover:text-emerald-700 underline transition-colors"
            >
              the90minutedrip@gmail.com
            </a>
          </div>

          {/* Website */}
          <div className="border-l-4 border-emerald-500 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Website</h2>
            </div>
            <a
              href="https://www.the90minutedrip.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 underline transition-colors"
            >
              https://www.the90minutedrip.store/
            </a>
          </div>

          {/* Address */}
          <div className="border-l-4 border-emerald-500 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Address</h2>
            </div>
            <div className="text-gray-700 leading-relaxed space-y-1">
              <p>Thejus House</p>
              <p>Kulukkalur</p>
              <p>Cherpulassery P.O</p>
              <p>Palakkad District</p>
              <p>Kerala – 679503</p>
              <p>India</p>
            </div>
          </div>
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
