import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Product, SizeKey } from '@/types/product';

interface OrderFormData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  selectedSize: SizeKey | '';
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as Product | undefined;

  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    selectedSize: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No product selected</h1>
          <Link to="/" className="text-primary hover:underline">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  // Get available sizes
  const availableSizes = (['XS', 'S', 'M', 'L', 'XL', 'XXL'] as SizeKey[]).filter(
    (size) => product.stock[size] > 0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, selectedSize: value as SizeKey }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.selectedSize) {
      toast({
        title: 'Size required',
        description: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.phone.match(/^[6-9]\d{9}$/)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit Indian phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const finalPrice = product.price || 0;
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productName: product.productName,
          amount: finalPrice,
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          size: formData.selectedSize,
          color: product.productName,
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
      });

      if (error) throw error;

      if (data?.success && data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data?.error || 'Failed to create payment request');
      }
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.';
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasDiscount = product.originalPrice && product.price && product.originalPrice > product.price;
  const finalPrice = product.price || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Confirm Your Order</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Summary
            </h2>
            <div className="flex gap-4">
              <img
                src={product.images[0]}
                alt={product.productName}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{product.productName}</h3>
                <p className="text-sm text-muted-foreground">{product.team}</p>
                <p className="text-sm text-muted-foreground">{product.season}</p>
                <div className="mt-2">
                  {hasDiscount ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">₹{product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg">₹{product.price}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{finalPrice}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{finalPrice}</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="selectedSize">Size *</Label>
                <Select
                  value={formData.selectedSize}
                  onValueChange={handleSizeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} ({product.stock[size]} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="House/Flat No., Street, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pincode">PIN Code *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  placeholder="6-digit PIN code"
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${finalPrice}`
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
