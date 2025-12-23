import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import CartSheet from './CartSheet';

interface HeaderProps {
    totalProducts: number;
    filteredCount: number;
    loading: boolean;
    error: boolean;
}

export default function Header({ totalProducts, filteredCount, loading, error }: HeaderProps) {
    const { getItemCount } = useCart();
    const itemCount = getItemCount();

    return (
        <header className="py-6 px-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-40">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <h1 className="text-2xl font-semibold tracking-tight">The 90-Minute Drip</h1>
                        <div className="text-sm text-gray-500">
                            {!loading && !error && (
                                <span>{filteredCount} of {totalProducts} jerseys</span>
                            )}
                        </div>
                    </div>

                    <CartSheet>
                        <Button variant="outline" size="icon" className="relative shrink-0">
                            <ShoppingBag className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {itemCount}
                                </span>
                            )}
                        </Button>
                    </CartSheet>
                </div>
            </div>
        </header>
    );
}
