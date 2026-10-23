const programs = [
  {
    number: '01',
    title: 'Pengembangan Mahasiswa',
    description:
      'Pendampingan bagi mahasiswa untuk membangun arah, kebiasaan, dan kesiapan menuju dunia kerja.',
    points: ['Kesiapan karier', 'Kepemimpinan', 'Penguatan akademik'],
  },
  {
    number: '02',
    title: 'Talent Upgrading',
    description:
      'Pelatihan keterampilan teknis dan soft skill yang relevan dengan kebutuhan industri.',
    points: ['Komunikasi', 'Problem solving', 'Etika profesional'],
  },
  {
    number: '03',
    title: 'Mentorship',
    description:
      'Pendampingan personal bersama mentor profesional untuk membangun arah karier yang terarah.',
    points: ['Sesi 1-on-1', 'Umpan balik', 'Jejaring profesional'],
  },
];

export function ProgramsGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {programs.map((program) => (
        <article
          key={program.number}
          className="group relative flex flex-col rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="font-serif text-sm font-semibold text-amber-600">
            {program.number}
          </span>
          <h3 className="mt-4 font-serif text-xl font-semibold text-emerald-950">
            {program.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
            {program.description}
          </p>
          <ul className="mt-5 space-y-2 border-t border-emerald-900/10 pt-4 text-sm text-stone-600">
            {program.points.map((point) => (
              <li key={point} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-amber-500"
                />
                {point}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
