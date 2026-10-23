import {
  buildCsv,
  detectDelimiter,
  parseActivityStatusToken,
  parseCsv,
  parseDateToken,
  parseGenderToken,
  parseYearToken,
  resolveCsvColumn,
} from './members-csv';

describe('members CSV helpers', () => {
  describe('parseCsv', () => {
    it('parses plain rows and drops blank lines', () => {
      const rows = parseCsv('a,b\n1,2\n\n3,4\n', ',');

      expect(rows).toEqual([
        ['a', 'b'],
        ['1', '2'],
        ['3', '4'],
      ]);
    });

    it('handles quoted commas, escaped quotes and embedded newlines', () => {
      const text =
        'full_name,address\n"Rahma, Aisyah","Jl. Merdeka ""No. 1""\nBandung"\n';

      expect(parseCsv(text, ',')).toEqual([
        ['full_name', 'address'],
        ['Rahma, Aisyah', 'Jl. Merdeka "No. 1"\nBandung'],
      ]);
    });

    it('ignores a UTF-8 BOM', () => {
      const rows = parseCsv('\uFEFFfull_name\nAisyah\n', ',');

      expect(resolveCsvColumn(rows[0][0])).toBe('full_name');
    });
  });

  describe('detectDelimiter', () => {
    it('picks the semicolon for Excel-style exports', () => {
      expect(detectDelimiter('nama;email;no_hp\nAisyah;a@b.com;0812')).toBe(';');
    });

    it('picks the comma by default', () => {
      expect(detectDelimiter('nama,email\nAisyah,a@b.com')).toBe(',');
    });
  });

  describe('resolveCsvColumn', () => {
    it('accepts canonical and Indonesian headers', () => {
      expect(resolveCsvColumn('full_name')).toBe('full_name');
      expect(resolveCsvColumn('Nama Lengkap')).toBe('full_name');
      expect(resolveCsvColumn('No HP')).toBe('phone');
      expect(resolveCsvColumn('Jurusan')).toBe('major');
      expect(resolveCsvColumn('Status Keaktifan')).toBe('activity_status');
    });

    it('ignores unknown columns', () => {
      expect(resolveCsvColumn('catatan_internal')).toBeUndefined();
    });
  });

  describe('buildCsv', () => {
    it('adds a BOM, CRLF endings and escapes special characters', () => {
      const csv = buildCsv([
        ['full_name', 'address'],
        ['Rahma, Aisyah', 'Jl. "Merdeka"'],
      ]);

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toBe(
        '\uFEFFfull_name,address\r\n"Rahma, Aisyah","Jl. ""Merdeka"""\r\n',
      );
    });
  });

  describe('token normalization', () => {
    it('normalizes gender values', () => {
      expect(parseGenderToken('Perempuan')).toBe('P');
      expect(parseGenderToken('laki-laki')).toBe('L');
      expect(parseGenderToken('L')).toBe('L');
    });

    it('normalizes activity status values', () => {
      expect(parseActivityStatusToken('Aktif')).toBe('active');
      expect(parseActivityStatusToken('Hilang Kontak')).toBe('lost contact');
      expect(parseActivityStatusToken('Pindah')).toBe('mutated');
    });

    it('normalizes dates from ISO and Indonesian spreadsheets', () => {
      expect(parseDateToken('2004-05-17')).toBe('2004-05-17');
      expect(parseDateToken('17/05/2004')).toBe('2004-05-17');
      expect(parseDateToken('7-5-2004')).toBe('2004-05-07');
    });

    it('extracts a four digit year', () => {
      expect(parseYearToken('2022')).toBe(2022);
      expect(parseYearToken('2019/2020')).toBe(2019);
      expect(parseYearToken('')).toBeUndefined();
      expect(Number.isNaN(parseYearToken('abc'))).toBe(true);
    });
  });
});
