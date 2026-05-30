export default function MarqueeBanner() {
  const items = [
    '🏪 Kirana Store',
    '💈 Salon',
    '🍛 Restaurant',
    '💊 Medical Shop',
    '👗 Boutique',
    '🔧 Repair Shop',
    '📱 Mobile Store',
    '🥗 Tiffin Service',
    '💐 Flower Shop',
    '🏋️ Gym',
    '📚 Coaching Centre',
    '🚗 Auto Garage',
    '🧁 Bakery',
    '🐄 Dairy',
    '📸 Photography Studio',
    '🛋️ Furniture Shop',
  ];

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-4"
      style={{
        background: '#0D0D0D',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #0D0D0D 0%, transparent 100%)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #0D0D0D 0%, transparent 100%)' }}
      />

      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-6 text-sm font-medium whitespace-nowrap"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {item}
            <span
              className="inline-block w-1 h-1 rounded-full mx-2"
              style={{ background: 'rgba(255,107,26,0.4)' }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
