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
    <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
      {programs.map((program) => (
        <article
          key={program.number}
          className="border-t border-rule-strong pt-5"
        >
          <span className="font-serif text-sm text-azure-600">
            {program.number}
          </span>
          <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink">
            {program.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {program.description}
          </p>
          <ul className="mt-5 space-y-1.5 text-sm text-ink-muted">
            {program.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
