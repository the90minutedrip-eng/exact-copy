import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');
  const paymentStatus = searchParams.get('payment_status');
  const paymentRequestId = searchParams.get('payment_request_id');

  const isSuccess = paymentStatus === 'Credit';

  useEffect(() => {
    console.log('Payment callback received:', {
      paymentId,
      paymentStatus,
      paymentRequestId,
    });
  }, [paymentId, paymentStatus, paymentRequestId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card rounded-lg p-8 border shadow-lg">
          {isSuccess ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your order. We've received your payment and will process your order shortly.
              </p>
              {paymentId && (
                <p className="text-sm text-muted-foreground mb-6">
                  Payment ID: <span className="font-mono">{paymentId}</span>
                </p>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
              <p className="text-muted-foreground mb-6">
                Unfortunately, your payment could not be processed. Please try again or contact support.
              </p>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full" variant={isSuccess ? "default" : "outline"}>
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            {!isSuccess && (
              <Link to="/">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
