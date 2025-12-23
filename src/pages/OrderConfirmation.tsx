import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/backendClient';
import type { Product, SizeKey } from '@/types/product';
import { useCart } from '@/contexts/CartContext';

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
  const { items: cartItems, getCartTotal, clearCart } = useCart();

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

  // Derived state
  const locationState = location.state as { product?: Product & { selectedSize?: SizeKey } };
  const singleProduct = locationState?.product;
  const isSingleBuy = !!singleProduct;
  const itemsToCheckout = isSingleBuy
    ? [{ ...singleProduct, quantity: 1, selectedSize: singleProduct.selectedSize || '' }]
    : cartItems;

  if (itemsToCheckout.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
          <p className="mb-4 text-muted-foreground">Your cart is empty and no product was selected.</p>
          <Link to="/" className="text-primary hover:underline">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  // For single buy, we might have size options if not pre-selected
  const availableSizes = isSingleBuy && singleProduct
    ? (['XS', 'S', 'M', 'L', 'XL', 'XXL'] as SizeKey[]).filter((size) => singleProduct.stock[size] > 0)
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, selectedSize: value as SizeKey }));
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, state: value }));
  };

  // Calculate shipping charges
  const calculateShipping = () => {
    const subtotal = isSingleBuy ? (singleProduct.price || 0) : getCartTotal();
    const state = formData.state.toLowerCase();

    // Kerala: ₹40 default, free if cart > ₹600
    if (state === 'kerala') {
      return subtotal > 600 ? 0 : 40;
    }

    // Other states: ₹80 default, free if cart > ₹1000
    return subtotal > 1000 ? 0 : 80;
  };

  const shippingCharge = calculateShipping();
  const subtotal = isSingleBuy ? (singleProduct.price || 0) : getCartTotal();
  const finalTotal = subtotal + shippingCharge;

  // Calculate how much more needed for free shipping
  const getFreeShippingMessage = () => {
    if (!formData.state) return null;

    const state = formData.state.toLowerCase();
    if (state === 'kerala') {
      const needed = 600 - subtotal;
      if (needed > 0) {
        return `Add ₹${needed} more to get free shipping!`;
      }
    } else {
      const needed = 1000 - subtotal;
      if (needed > 0) {
        return `Add ₹${needed} more to get free shipping!`;
      }
    }
    return null;
  };

  const freeShippingMessage = getFreeShippingMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSingleBuy && !formData.selectedSize && !singleProduct.selectedSize) {
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
      const finalPrice = finalTotal;

      const productName = isSingleBuy
        ? singleProduct.productName
        : `Order of ${itemsToCheckout.length} items`;

      // Aggregate details for description
      const description = itemsToCheckout.map(item =>
        `${item.productName} (${item.selectedSize}) x${item.quantity}`
      ).join(', ');

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productName: productName,
          amount: finalPrice,
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          size: isSingleBuy ? (formData.selectedSize || singleProduct.selectedSize) : 'Mixed',
          color: description,
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
      });

      if (error) throw error;

      if (data?.success && data?.paymentUrl) {
        if (!isSingleBuy) {
          clearCart();
        }
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

  // Removed duplicate finalPrice calculation (now using finalTotal from shipping logic)

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
            {itemsToCheckout.map((item, index) => (
              <div key={index} className="flex gap-4 mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0">
                <img
                  src={item.images[0]}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.productName}</h3>
                  <p className="text-xs text-muted-foreground">Size: {item.selectedSize || formData.selectedSize}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                    <span className="font-semibold text-sm">₹{(item.price || 0) * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span>
                <div className="text-right">
                  {!formData.state ? (
                    <span className="text-blue-600 text-xs">Select state to check shipping</span>
                  ) : shippingCharge === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>₹{shippingCharge}</span>
                  )}
                </div>
              </div>
              {freeShippingMessage && (
                <div className="flex justify-end text-xs text-orange-600 mb-2">
                  {freeShippingMessage}
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSingleBuy && !singleProduct.selectedSize && (
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
                          {size} ({singleProduct.stock[size]} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                  <Select
                    value={formData.state}
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kerala">Kerala</SelectItem>
                      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                      <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                      <SelectItem value="Assam">Assam</SelectItem>
                      <SelectItem value="Bihar">Bihar</SelectItem>
                      <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                      <SelectItem value="Goa">Goa</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Manipur">Manipur</SelectItem>
                      <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                      <SelectItem value="Mizoram">Mizoram</SelectItem>
                      <SelectItem value="Nagaland">Nagaland</SelectItem>
                      <SelectItem value="Odisha">Odisha</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Sikkim">Sikkim</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                      <SelectItem value="Tripura">Tripura</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                    </SelectContent>
                  </Select>
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
                  `Pay ₹${finalTotal}`
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
