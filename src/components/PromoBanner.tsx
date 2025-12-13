import { Truck, Tag, Gift, Palette, Users } from 'lucide-react';

const promoItems = [
  { icon: Truck, text: "Pan India Shipping" },
  { icon: Tag, text: "Affordable Pricing" },
  { icon: Gift, text: "Buy 2 → Free Shipping in Kerala" },
  { icon: Truck, text: "Buy 4 → Free Shipping All India" },
  { icon: Palette, text: "Custom Works Available" },
  { icon: Users, text: "Wholesale Deals Available" },
];

export default function PromoBanner() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-300/20 to-teal-400/20 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 50%, rgba(255,255,255,0.4) 100%)',
        }}
      />
      
      <div className="relative py-1.5 sm:py-2">
        <div className="overflow-hidden">
          <div className="flex animate-scroll">
            {[...promoItems, ...promoItems].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 flex-shrink-0"
              >
                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" strokeWidth={2} />
                <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  {item.text}
                </span>
                <span className="text-emerald-400 ml-2 sm:ml-4">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
    </div>
  );
}
