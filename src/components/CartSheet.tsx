import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface CartSheetProps {
    children: React.ReactNode;
}

export default function CartSheet({ children }: CartSheetProps) {
    const { items, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/order');
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Your Cart ({getItemCount()})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden py-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <ShoppingBag className="w-16 h-16 text-gray-200" />
                            <div className="text-lg font-medium text-gray-900">Your cart is empty</div>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Looks like you haven't added any jerseys to your cart yet.
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 py-4 border-b">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                            <img
                                                src={item.images[0]}
                                                alt={item.productName}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3 className="line-clamp-1">{item.productName}</h3>
                                                    <p className="ml-4">₹{(item.price || 0) * item.quantity}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{item.team}</p>
                                                <p className="mt-1 text-sm text-gray-500">Size: {item.selectedSize}</p>
                                            </div>

                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <div className="flex items-center gap-2 border rounded-md">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="font-medium text-red-600 hover:text-red-500 px-0"
                                                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="border-t pt-6 bg-white shrink-0">
                        <div className="w-full space-y-4">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <p>Subtotal</p>
                                <p>₹{getCartTotal()}</p>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <p>Shipping</p>
                                <p className="text-blue-600 text-xs">Select address to check shipping cost</p>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-4">
                                <p>Subtotal</p>
                                <p>₹{getCartTotal()}</p>
                            </div>
                            <div className="mt-6">
                                <Button className="w-full bg-black hover:bg-gray-800 text-white" size="lg" onClick={handleCheckout}>
                                    Checkout
                                </Button>
                            </div>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
