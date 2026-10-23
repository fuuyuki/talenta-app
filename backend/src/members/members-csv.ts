/**
 * CSV helpers for the member roster.
 *
 * The exported header uses the canonical snake_case column names so a file can
 * be exported, edited in a spreadsheet, and imported back unchanged. Imports
 * also accept common Indonesian header names (see HEADER_ALIASES).
 */

export const MEMBER_CSV_COLUMNS = [
  'full_name',
  'email',
  'phone',
  'gender',
  'birth_place',
  'birth_date',
  'address',
  'school',
  'city',
  'occupation',
  'university',
  'faculty',
  'major',
  'entry_year',
  'graduation_year',
  'mentorship_tier',
  'activity_status',
] as const;

export type MemberCsvColumn = (typeof MEMBER_CSV_COLUMNS)[number];

const HEADER_ALIASES: Record<string, MemberCsvColumn> = {
  full_name: 'full_name',
  nama_lengkap: 'full_name',
  nama: 'full_name',
  email: 'email',
  e_mail: 'email',
  alamat_email: 'email',
  phone: 'phone',
  no_hp: 'phone',
  nomor_hp: 'phone',
  telepon: 'phone',
  handphone: 'phone',
  whatsapp: 'phone',
  gender: 'gender',
  jenis_kelamin: 'gender',
  jk: 'gender',
  birth_place: 'birth_place',
  tempat_lahir: 'birth_place',
  birth_date: 'birth_date',
  tanggal_lahir: 'birth_date',
  tgl_lahir: 'birth_date',
  address: 'address',
  alamat: 'address',
  alamat_lengkap: 'address',
  school: 'school',
  sekolah: 'school',
  asal_sekolah: 'school',
  sma: 'school',
  city: 'city',
  kota: 'city',
  domisili: 'city',
  kota_domisili: 'city',
  occupation: 'occupation',
  pekerjaan: 'occupation',
  university: 'university',
  universitas: 'university',
  kampus: 'university',
  perguruan_tinggi: 'university',
  faculty: 'faculty',
  fakultas: 'faculty',
  major: 'major',
  jurusan: 'major',
  prodi: 'major',
  entry_year: 'entry_year',
  tahun_masuk: 'entry_year',
  angkatan: 'entry_year',
  graduation_year: 'graduation_year',
  tahun_lulus: 'graduation_year',
  mentorship_tier: 'mentorship_tier',
  level: 'mentorship_tier',
  tier: 'mentorship_tier',
  activity_status: 'activity_status',
  keaktifan: 'activity_status',
  status_keaktifan: 'activity_status',
  status: 'activity_status',
};

/** Maps a raw header cell to a canonical column, or `undefined` if unknown. */
export function resolveCsvColumn(raw: string): MemberCsvColumn | undefined {
  const token = raw
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return HEADER_ALIASES[token];
}

/** Picks `;` when the header line looks semicolon-separated (Excel locale). */
export function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] ?? '';

  let commas = 0;
  let semicolons = 0;
  let inQuotes = false;

  for (const char of firstLine) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && char === ',') {
      commas += 1;
    } else if (!inQuotes && char === ';') {
      semicolons += 1;
    }
  }

  return semicolons > commas ? ';' : ',';
}

/** RFC 4180 parser: quoted fields, escaped quotes, embedded newlines. */
export function parseCsv(text: string, delimiter: ',' | ';'): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }
    if (char === '\r') {
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

function escapeCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);

  if (/[",\r\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Builds a UTF-8 CSV with a BOM and CRLF line endings so Excel opens it with
 * the right encoding and without mangling Indonesian names.
 */
export function buildCsv(rows: unknown[][]): string {
  const body = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
  return `\uFEFF${body}\r\n`;
}

export function formatCsvDate(value: Date | null | undefined): string {
  if (!value) return '';
  return value.toISOString().slice(0, 10);
}

/** Accepts L/P, "Laki-laki", "Perempuan", and English equivalents. */
export function parseGenderToken(value: string): string | undefined {
  const token = value.trim().toLowerCase();
  if (!token) return undefined;

  if (['l', 'lk', 'laki-laki', 'laki laki', 'male', 'm'].includes(token)) {
    return 'L';
  }
  if (['p', 'pr', 'perempuan', 'female', 'f'].includes(token)) {
    return 'P';
  }

  // Let the normal validator produce a clear error message.
  return value;
}

/** Accepts both the canonical values and common Indonesian labels. */
export function parseActivityStatusToken(value: string): string | undefined {
  const token = value.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  if (!token) return undefined;

  const aliases: Record<string, string> = {
    aktif: 'active',
    active: 'active',
    'tidak aktif': 'inactive',
    nonaktif: 'inactive',
    inactive: 'inactive',
    pindah: 'mutated',
    mutated: 'mutated',
    'hilang kontak': 'lost contact',
    'lost contact': 'lost contact',
  };

  return aliases[token] ?? value;
}

/** Accepts ISO (`2026-10-24`) and Indonesian spreadsheet (`24/10/2026`). */
export function parseDateToken(value: string): string | undefined {
  const text = value.trim();
  if (!text) return undefined;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    return `${dmy[3]}-${month}-${day}`;
  }

  return text;
}

export function parseYearToken(value: string | undefined): number | undefined {
  if (!value) return undefined;

  const match = /^\d{4}/.exec(value.trim());
  return match ? Number(match[0]) : Number.NaN;
}
