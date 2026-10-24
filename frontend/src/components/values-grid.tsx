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
  const ruleClass = tone === 'dark' ? 'border-rule-dark' : 'border-rule';
  const titleClass = tone === 'dark' ? 'text-on-dark' : 'text-ink';
  const bodyClass = tone === 'dark' ? 'text-on-dark-muted' : 'text-ink-muted';
  const markerClass = tone === 'dark' ? 'text-azure-300' : 'text-azure-600';

  return (
    <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {values.map((value, index) => (
        <div key={value.title} className={`border-t pt-4 ${ruleClass}`}>
          <span className={`font-serif text-sm ${markerClass}`}>
            0{index + 1}
          </span>
          <h3 className={`mt-2 font-serif text-lg font-semibold ${titleClass}`}>
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
