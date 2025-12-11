import React, {useState} from 'react'

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Classic Home Jersey',
    price: 2499,
    images: [
      'https://via.placeholder.com/800x800?text=Home+1',
      'https://via.placeholder.com/800x800?text=Home+2',
      'https://via.placeholder.com/800x800?text=Home+3'
    ],
    description: 'Clean, breathable jersey with embroidered badge. Slim fit.'
  },
  {
    id: 'p2',
    name: 'Away Contrast Jersey',
    price: 2699,
    images: [
      'https://via.placeholder.com/800x800?text=Away+1',
      'https://via.placeholder.com/800x800?text=Away+2'
    ],
    description: 'High-contrast away kit. Lightweight and sweat-wicking.'
  },
  {
    id: 'p3',
    name: 'Third Edition Drift Jersey',
    price: 2999,
    images: [
      'https://via.placeholder.com/800x800?text=Third+1',
      'https://via.placeholder.com/800x800?text=Third+2',
      'https://via.placeholder.com/800x800?text=Third+3'
    ],
    description: 'Limited-edition seasonal drop. Bold print, relaxed fit.'
  },
  {
    id: 'p4',
    name: 'Retro Stripe Jersey',
    price: 2199,
    images: [
      'https://via.placeholder.com/800x800?text=Retro+1',
    ],
    description: 'Vintage stripes, modern fabric. A classic reimagined.'
  }
]

const SIZES = ['XS','S','M','L','XL','XXL']
const WHATSAPP_NUMBER = '918139016845'
const CONTACT_EMAIL = 'the90minutedrip@gmail.com'

export default function The90MinuteDrip() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<typeof PRODUCTS[0] | null>(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [imgIndex, setImgIndex] = useState(0)

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
    p.description.toLowerCase().includes(query.trim().toLowerCase())
  )

  function openModal(product: typeof PRODUCTS[0]) {
    setSelected(product)
    setSelectedSize('M')
    setImgIndex(0)
  }

  function closeModal() {
    setSelected(null)
  }

  function nextImage() {
    if (!selected) return
    setImgIndex((imgIndex + 1) % selected.images.length)
  }
  function prevImage() {
    if (!selected) return
    setImgIndex((imgIndex - 1 + selected.images.length) % selected.images.length)
  }

  function whatsappHref() {
    if (!selected) return '#'
    const message = `Hi, I'm interested in the *${selected.name}* in size *${selectedSize}*.`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="min-h-screen bg-white text-black antialiased flex flex-col">
      <header className="py-6 px-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-semibold tracking-tight">The 90-Minute Drip</div>
          <div className="w-80">
            <label className="sr-only">Search jerseys</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search jerseys — name or feature"
              className="w-full px-3 py-2 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto p-6">
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <article key={p.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button onClick={() => openModal(p)} className="w-full text-left">
                  <div className="h-56 bg-gray-50 flex items-center justify-center">
                    <img src={p.images[0]} alt={p.name} className="object-cover h-full w-full" />
                  </div>
                  <div className="p-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-2 text-sm text-gray-600">₹{p.price.toLocaleString()}</div>
                  </div>
                </button>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">No jerseys found for "{query}"</div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-600">
          <div>Made for fans — browse and inquire on WhatsApp.</div>
          <div>Contact: <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a></div>
        </div>
      </footer>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="relative bg-white rounded-2xl max-w-3xl w-full mx-4 overflow-hidden shadow-2xl">
            <div className="flex">
              <div className="w-1/2 p-4">
                <div className="relative">
                  <img src={selected.images[imgIndex]} alt={`${selected.name} ${imgIndex+1}`} className="w-full h-80 object-cover rounded-md" />
                  {selected.images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow">◀</button>
                      <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow">▶</button>
                    </>
                  )}
                </div>

                {selected.images.length > 1 && (
                  <div className="mt-3 flex gap-2">
                    {selected.images.map((img, i) => (
                      <button key={i} onClick={() => setImgIndex(i)} className={`w-16 h-16 rounded-md overflow-hidden border ${i === imgIndex ? 'ring-2 ring-green-500' : 'border-gray-200'}`}>
                        <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-1/2 p-6 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selected.name}</h3>
                    <div className="mt-2 text-gray-600">₹{selected.price.toLocaleString()}</div>
                  </div>
                  <button onClick={closeModal} className="text-gray-500">✕</button>
                </div>

                <p className="mt-4 text-sm text-gray-700 flex-1">{selected.description}</p>

                <div className="mt-6">
                  <div className="text-sm text-gray-600 mb-2">Select size</div>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map(s => (
                      <label key={s} className={`cursor-pointer border rounded-md px-3 py-2 text-sm ${selectedSize === s ? 'ring-2 ring-green-500 border-transparent' : 'border-gray-200'}`}>
                        <input type="radio" name="size" value={s} checked={selectedSize === s} onChange={() => setSelectedSize(s)} className="sr-only" />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-black">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.7 20.1L2 22l2-1.2A11 11 0 1 0 20.5 3.5zM13 17.5h-.2a7 7 0 0 1-3.6-1L8 16l-.9.2a4.9 4.9 0 0 1-2.9-2.6l-.2-.5L4 12.9l.1-.2A4.9 4.9 0 0 1 7 9.3c.8-.1 1.7 0 2.4.3l.4.2.6-.4a7 7 0 0 1 4.2-1.4h.1a4.9 4.9 0 0 1 3.5 1.6 4.9 4.9 0 0 1 1.4 3.6A7 7 0 0 1 13 17.5z"/></svg>
                    Inquire on WhatsApp
                  </a>
                </div>

                <div className="mt-4 text-xs text-gray-500">By clicking WhatsApp you'll open a chat with prefilled details.</div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
