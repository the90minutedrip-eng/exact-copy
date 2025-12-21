import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');

  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const paymentId = searchParams.get('payment_id');

    if (paymentStatus === 'Credit' && paymentId) {
      setStatus('success');
    } else if (paymentStatus === 'Failed') {
      setStatus('failed');
    } else {
      setStatus('pending');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center">
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Payment ID:</span>{' '}
                {searchParams.get('payment_id')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Request ID:</span>{' '}
                {searchParams.get('payment_request_id')}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              We'll send you a confirmation email shortly. For any queries, feel free to contact us on WhatsApp.
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">
              Unfortunately, your payment could not be processed. Please try again or contact us for assistance.
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Pending</h1>
            <p className="text-muted-foreground mb-6">
              Your payment is being processed. Please wait or check back later.
            </p>
          </>
        )}

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
