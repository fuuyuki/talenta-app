const values = [
  {
    title: 'Amanah',
    description: 'Menjaga kepercayaan dengan integritas dan tanggung jawab.',
  },
  {
    title: 'Ilmu',
    description: 'Terus belajar dan mengasah kompetensi yang relevan.',
  },
  {
    title: 'Khidmah',
    description: 'Mengabdikan kemampuan untuk manfaat yang lebih luas.',
  },
  {
    title: 'Ihsan',
    description: 'Bekerja dengan standar terbaik dan niat yang lurus.',
  },
];

export function ValuesGrid({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const cardClass =
    tone === 'dark'
      ? 'border-white/10 bg-white/5'
      : 'border-emerald-900/10 bg-white';
  const titleClass = tone === 'dark' ? 'text-white' : 'text-emerald-950';
  const bodyClass =
    tone === 'dark' ? 'text-emerald-100/70' : 'text-stone-600';
  const markerClass = tone === 'dark' ? 'text-amber-300' : 'text-amber-600';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {values.map((value, index) => (
        <div key={value.title} className={`rounded-2xl border p-5 ${cardClass}`}>
          <span className={`font-serif text-sm font-semibold ${markerClass}`}>
            0{index + 1}
          </span>
          <h3 className={`mt-3 font-serif text-lg font-semibold ${titleClass}`}>
            {value.title}
          </h3>
          <p className={`mt-2 text-sm leading-relaxed ${bodyClass}`}>
            {value.description}
          </p>
        </div>
      ))}
    </div>
  );
}
