import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import type {
  membersUncheckedCreateInput,
  membersUncheckedUpdateInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma.service';
import {
  MEMBER_CSV_COLUMNS,
  buildCsv,
  detectDelimiter,
  formatCsvDate,
  parseActivityStatusToken,
  parseCsv,
  parseDateToken,
  parseGenderToken,
  parseYearToken,
  resolveCsvColumn,
  type MemberCsvColumn,
} from './members-csv';

const ACTIVITY_STATUSES = [
  'active',
  'inactive',
  'mutated',
  'lost contact',
] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

const GENDERS = ['L', 'P'] as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_IMPORT_ROWS = 5000;
const MAX_REPORTED_ERRORS = 25;

const TEMPLATE_SAMPLE_ROW = [
  'Aisyah Rahma',
  'aisyah@contoh.com',
  '081234567890',
  'P',
  'Bandung',
  '2004-05-17',
  'Jl. Merdeka No. 1',
  'SMA Negeri 1 Bandung',
  'Bandung',
  'Mahasiswa',
  'Universitas Padjadjaran',
  'Ekonomi',
  'Manajemen',
  '2022',
  '',
  'Dasar',
  'active',
];

export type CreateMemberInput = {
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  sma_id?: number;
  domisili_id?: number;
  occupation_id?: number;
  university_id?: number;
  faculty?: string;
  major?: string;
  entry_year?: number;
  graduation_year?: number;
  mentorship_tier?: string;
  activity_status?: string;
  group_id?: string | null;
  mentor_id?: string | null;
};

export type CreateMemberAccountInput = {
  email?: string;
  password?: string;
  roles?: string[];
};

type MemberData = Omit<membersUncheckedCreateInput, 'full_name'> & {
  full_name?: string;
};

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new BadRequestException(`${field} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function optionalInt(
  value: unknown,
  field: string,
  min?: number,
  max?: number,
): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(parsed)) {
    throw new BadRequestException(`${field} must be an integer`);
  }
  if (min !== undefined && parsed < min) {
    throw new BadRequestException(`${field} must be at least ${min}`);
  }
  if (max !== undefined && parsed > max) {
    throw new BadRequestException(`${field} must be at most ${max}`);
  }

  return parsed;
}

function optionalUuid(value: unknown, field: string): string | undefined {
  const text = optionalText(value, field);
  if (text !== undefined && !UUID_PATTERN.test(text)) {
    throw new BadRequestException(`Invalid ${field}`);
  }
  return text;
}

function optionalDate(value: unknown, field: string): Date | undefined {
  const text = optionalText(value, field);
  if (text === undefined) return undefined;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`Invalid ${field}`);
  }
  return parsed;
}

function normalizeStatus(value: unknown): ActivityStatus | undefined {
  const text = optionalText(value, 'activity_status');
  if (text === undefined) return undefined;
  if (!(ACTIVITY_STATUSES as readonly string[]).includes(text)) {
    throw new BadRequestException('Invalid activity_status');
  }
  return text as ActivityStatus;
}

function normalizeGender(value: unknown): string | undefined {
  const text = optionalText(value, 'gender');
  if (text === undefined) return undefined;
  if (!(GENDERS as readonly string[]).includes(text)) {
    throw new BadRequestException('Invalid gender');
  }
  return text;
}

/** Scalar column values only; `user_id` is managed by the account endpoints. */
function buildMemberData(input: CreateMemberInput): MemberData {
  const data: MemberData = {};

  const fullName = optionalText(input.full_name, 'full_name');
  if (fullName !== undefined) data.full_name = fullName;

  const email = optionalText(input.email, 'email');
  if (email !== undefined) {
    if (!EMAIL_PATTERN.test(email)) {
      throw new BadRequestException('Invalid email address');
    }
    data.email = email.toLowerCase();
  }

  const phone = optionalText(input.phone, 'phone');
  if (phone !== undefined) data.phone = phone;

  const gender = normalizeGender(input.gender);
  if (gender !== undefined) data.gender = gender;

  const birthPlace = optionalText(input.birth_place, 'birth_place');
  if (birthPlace !== undefined) data.birth_place = birthPlace;

  const birthDate = optionalDate(input.birth_date, 'birth_date');
  if (birthDate !== undefined) data.birth_date = birthDate;

  const address = optionalText(input.address, 'address');
  if (address !== undefined) data.address = address;

  const smaId = optionalInt(input.sma_id, 'sma_id', 1);
  if (smaId !== undefined) data.sma_id = smaId;

  const domisiliId = optionalInt(input.domisili_id, 'domisili_id', 1);
  if (domisiliId !== undefined) data.domisili_id = domisiliId;

  const occupationId = optionalInt(input.occupation_id, 'occupation_id', 1);
  if (occupationId !== undefined) data.occupation_id = occupationId;

  const universityId = optionalInt(input.university_id, 'university_id', 1);
  if (universityId !== undefined) data.university_id = universityId;

  const faculty = optionalText(input.faculty, 'faculty');
  if (faculty !== undefined) data.faculty = faculty;

  const major = optionalText(input.major, 'major');
  if (major !== undefined) data.major = major;

  const entryYear = optionalInt(input.entry_year, 'entry_year', 1900, 2200);
  if (entryYear !== undefined) data.entry_year = entryYear;

  const graduationYear = optionalInt(
    input.graduation_year,
    'graduation_year',
    1900,
    2200,
  );
  if (graduationYear !== undefined) data.graduation_year = graduationYear;

  const tier = optionalText(input.mentorship_tier, 'mentorship_tier');
  if (tier !== undefined) data.mentorship_tier = tier;

  const status = normalizeStatus(input.activity_status);
  if (status !== undefined) data.activity_status = status;

  // Group / mentor can be cleared explicitly with null.
  if (input.group_id === null) {
    data.group_id = null;
  } else {
    const groupId = optionalUuid(input.group_id, 'group_id');
    if (groupId !== undefined) data.group_id = groupId;
  }

  if (input.mentor_id === null) {
    data.mentor_id = null;
  } else {
    const mentorId = optionalUuid(input.mentor_id, 'mentor_id');
    if (mentorId !== undefined) data.mentor_id = mentorId;
  }

  return data;
}

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminService: AdminService,
  ) {}

  private readonly memberSelect = {
    id: true,
    full_name: true,
    email: true,
    phone: true,
    gender: true,
    activity_status: true,
    mentorship_tier: true,
    created_at: true,
    user: {
      select: {
        id: true,
        email: true,
        is_active: true,
        user_roles: { select: { roles: { select: { code: true } } } },
      },
    },
    group: { select: { id: true, name: true } },
  } as const;

  private readonly memberDetailSelect = {
    id: true,
    user_id: true,
    full_name: true,
    email: true,
    phone: true,
    gender: true,
    birth_place: true,
    birth_date: true,
    address: true,
    sma_id: true,
    domisili_id: true,
    occupation_id: true,
    university_id: true,
    faculty: true,
    major: true,
    entry_year: true,
    graduation_year: true,
    mentorship_tier: true,
    activity_status: true,
    group_id: true,
    mentor_id: true,
    joined_at: true,
    created_at: true,
    updated_at: true,
    user: { select: { id: true, email: true, is_active: true } },
    group: { select: { id: true, name: true } },
    mentor: { select: { id: true, full_name: true } },
  } as const;

  async list(input: {
    search?: string;
    status?: string;
    hasAccount?: string;
    take?: string;
    skip?: string;
  }) {
    const search = input.search?.trim();
    const status = normalizeStatus(input.status);
    const take = optionalInt(input.take, 'take', 1, 100) ?? 50;
    const skip = optionalInt(input.skip, 'skip', 0) ?? 0;

    const where = {
      ...(status ? { activity_status: status } : {}),
      ...(input.hasAccount === 'true'
        ? { user_id: { not: null } }
        : input.hasAccount === 'false'
          ? { user_id: null }
          : {}),
      ...(search
        ? {
            OR: [
              {
                full_name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.members.findMany({
        where,
        orderBy: { full_name: 'asc' },
        take,
        skip,
        select: this.memberSelect,
      }),
      this.prisma.members.count({ where }),
    ]);

    return {
      items: rows.map((row) => {
        const { user, group, ...rest } = row;

        return {
          ...rest,
          group,
          account: user
            ? {
                id: user.id,
                email: user.email,
                is_active: user.is_active,
                roles: user.user_roles.map((item) => item.roles.code),
              }
            : null,
        };
      }),
      total,
      take,
      skip,
    };
  }

  async findOne(id: string) {
    this.assertMemberId(id);

    const member = await this.prisma.members.findUnique({
      where: { id },
      select: this.memberDetailSelect,
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async create(input: CreateMemberInput) {
    const data = buildMemberData(input);

    if (!data.full_name) {
      throw new BadRequestException('full_name is required');
    }

    try {
      return await this.prisma.members.create({
        data: data as membersUncheckedCreateInput,
        select: this.memberDetailSelect,
      });
    } catch (error) {
      this.translatePrismaError(error, 'create');
    }
  }

  async update(id: string, input: CreateMemberInput) {
    this.assertMemberId(id);

    const existing = await this.prisma.members.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Member not found');
    }

    if (input.mentor_id === id) {
      throw new BadRequestException('A member cannot be their own mentor');
    }

    const data = buildMemberData(input);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided');
    }

    try {
      return await this.prisma.members.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        } as membersUncheckedUpdateInput,
        select: this.memberDetailSelect,
      });
    } catch (error) {
      this.translatePrismaError(error, 'update');
    }
  }

  async remove(id: string) {
    this.assertMemberId(id);

    const member = await this.prisma.members.findUnique({
      where: { id },
      select: { id: true, user_id: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    if (member.user_id) {
      throw new ConflictException(
        'Member still has an account. Deactivate the account instead.',
      );
    }

    await this.prisma.members.delete({ where: { id } });

    return { message: 'Member deleted' };
  }

  async createAccount(id: string, input: CreateMemberAccountInput) {
    this.assertMemberId(id);

    const member = await this.prisma.members.findUnique({
      where: { id },
      select: { id: true, email: true, user_id: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    if (member.user_id) {
      throw new ConflictException('Member already has an account');
    }

    const email = input.email?.trim() || member.email || undefined;

    return this.adminService.createUser({
      email,
      password: input.password,
      roles: input.roles,
      member_id: id,
    });
  }

  async exportCsv() {
    const rows = await this.prisma.members.findMany({
      orderBy: { full_name: 'asc' },
      select: {
        full_name: true,
        email: true,
        phone: true,
        gender: true,
        birth_place: true,
        birth_date: true,
        address: true,
        schools: { select: { name: true } },
        cities: { select: { name: true } },
        occupations: { select: { name: true } },
        universities: { select: { name: true } },
        faculty: true,
        major: true,
        entry_year: true,
        graduation_year: true,
        mentorship_tier: true,
        activity_status: true,
      },
    });

    const lines: unknown[][] = [[...MEMBER_CSV_COLUMNS]];

    for (const row of rows) {
      lines.push([
        row.full_name,
        row.email ?? '',
        row.phone ?? '',
        row.gender ?? '',
        row.birth_place ?? '',
        formatCsvDate(row.birth_date),
        row.address ?? '',
        row.schools?.name ?? '',
        row.cities?.name ?? '',
        row.occupations?.name ?? '',
        row.universities?.name ?? '',
        row.faculty ?? '',
        row.major ?? '',
        row.entry_year ?? '',
        row.graduation_year ?? '',
        row.mentorship_tier ?? '',
        row.activity_status,
      ]);
    }

    return buildCsv(lines);
  }

  templateCsv() {
    return buildCsv([[...MEMBER_CSV_COLUMNS], TEMPLATE_SAMPLE_ROW]);
  }

  /**
   * Upserts members by email. Rows without an email are always inserted, and
   * empty cells leave the existing value untouched, so re-importing an export
   * is safe.
   */
  async importCsv(body: unknown) {
    if (typeof body !== 'string' || body.trim() === '') {
      throw new BadRequestException(
        'CSV body is required (send it with Content-Type: text/csv)',
      );
    }

    const delimiter = detectDelimiter(body);
    const rows = parseCsv(body, delimiter);

    if (rows.length < 2) {
      throw new BadRequestException(
        'CSV must contain a header row and at least one data row',
      );
    }

    const dataRowCount = rows.length - 1;
    if (dataRowCount > MAX_IMPORT_ROWS) {
      throw new BadRequestException(
        `Too many rows: ${dataRowCount} (max ${MAX_IMPORT_ROWS} per import)`,
      );
    }

    const headers = rows[0].map((value) => resolveCsvColumn(value));
    if (!headers.includes('full_name')) {
      throw new BadRequestException('CSV must include a full_name column');
    }

    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let index = 1; index < rows.length; index += 1) {
      const cells = rows[index];
      const raw: Partial<Record<MemberCsvColumn, string>> = {};

      headers.forEach((column, position) => {
        if (!column) return;
        const value = cells[position]?.trim();
        if (value) raw[column] = value;
      });

      try {
        const input = await this.memberInputFromCsv(raw);
        const data = buildMemberData(input);

        if (!data.full_name) {
          throw new BadRequestException('full_name is required');
        }

        const email = typeof data.email === 'string' ? data.email : undefined;
        const existing = email
          ? await this.prisma.members.findUnique({
              where: { email },
              select: { id: true },
            })
          : null;

        if (existing) {
          await this.prisma.members.update({
            where: { id: existing.id },
            data: {
              ...data,
              updated_at: new Date(),
            } as membersUncheckedUpdateInput,
          });
          updated += 1;
        } else {
          await this.prisma.members.create({
            data: data as membersUncheckedCreateInput,
          });
          created += 1;
        }
      } catch (error) {
        failed += 1;
        if (errors.length < MAX_REPORTED_ERRORS) {
          errors.push({
            row: index + 1,
            message: this.describeImportError(error),
          });
        }
      }
    }

    return {
      total: dataRowCount,
      created,
      updated,
      failed,
      errors,
      truncated: failed > errors.length,
    };
  }

  private async memberInputFromCsv(
    raw: Partial<Record<MemberCsvColumn, string>>,
  ): Promise<CreateMemberInput> {
    const input: CreateMemberInput = {
      full_name: raw.full_name,
      email: raw.email,
      phone: raw.phone,
      gender: raw.gender ? parseGenderToken(raw.gender) : undefined,
      birth_place: raw.birth_place,
      birth_date: raw.birth_date ? parseDateToken(raw.birth_date) : undefined,
      address: raw.address,
      faculty: raw.faculty,
      major: raw.major,
      entry_year: parseYearToken(raw.entry_year),
      graduation_year: parseYearToken(raw.graduation_year),
      mentorship_tier: raw.mentorship_tier,
      activity_status: raw.activity_status
        ? parseActivityStatusToken(raw.activity_status)
        : undefined,
    };

    if (raw.school) input.sma_id = await this.resolveSchool(raw.school);
    if (raw.city) input.domisili_id = await this.resolveCity(raw.city);
    if (raw.occupation) {
      input.occupation_id = await this.resolveOccupation(raw.occupation);
    }
    if (raw.university) {
      input.university_id = await this.resolveUniversity(raw.university);
    }

    return input;
  }

  /** Lookups are matched case-insensitively and created when missing. */
  private resolveSchool(name: string) {
    return this.resolveLookup(
      name,
      (value) =>
        this.prisma.schools.findFirst({
          where: { name: { equals: value, mode: 'insensitive' } },
          select: { id: true },
        }),
      (value) =>
        this.prisma.schools.create({
          data: { name: value },
          select: { id: true },
        }),
    );
  }

  private resolveCity(name: string) {
    return this.resolveLookup(
      name,
      (value) =>
        this.prisma.cities.findFirst({
          where: { name: { equals: value, mode: 'insensitive' } },
          select: { id: true },
        }),
      (value) =>
        this.prisma.cities.create({
          data: { name: value },
          select: { id: true },
        }),
    );
  }

  private resolveOccupation(name: string) {
    return this.resolveLookup(
      name,
      (value) =>
        this.prisma.occupations.findFirst({
          where: { name: { equals: value, mode: 'insensitive' } },
          select: { id: true },
        }),
      (value) =>
        this.prisma.occupations.create({
          data: { name: value },
          select: { id: true },
        }),
    );
  }

  private resolveUniversity(name: string) {
    return this.resolveLookup(
      name,
      (value) =>
        this.prisma.universities.findFirst({
          where: { name: { equals: value, mode: 'insensitive' } },
          select: { id: true },
        }),
      (value) =>
        this.prisma.universities.create({
          data: { name: value },
          select: { id: true },
        }),
    );
  }

  private async resolveLookup(
    rawName: string,
    findFirst: (name: string) => Promise<{ id: number } | null>,
    create: (name: string) => Promise<{ id: number }>,
  ): Promise<number | undefined> {
    const name = rawName.trim().replace(/\s+/g, ' ');
    if (!name) return undefined;

    const existing = await findFirst(name);
    if (existing) return existing.id;

    try {
      const created = await create(name);
      return created.id;
    } catch (error) {
      // A previous row may have created the same lookup concurrently.
      if ((error as { code?: string }).code === 'P2002') {
        const raced = await findFirst(name);
        if (raced) return raced.id;
      }
      throw error;
    }
  }

  private describeImportError(error: unknown): string {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      if (typeof response === 'string') return response;

      const message = (response as { message?: string | string[] }).message;
      if (Array.isArray(message)) return message.join(', ');
      return message ?? 'Invalid row';
    }

    const code = (error as { code?: string }).code;
    if (code === 'P2002') return 'Email already used by another member';
    if (code === 'P2003') return 'Invalid reference';
    if (code === 'P2023') return 'Invalid value for a column';

    return 'Could not save this row';
  }

  private assertMemberId(id: string) {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestException('Invalid member id');
    }
  }

  private translatePrismaError(
    error: unknown,
    action: 'create' | 'update',
  ): never {
    const code = (error as { code?: string }).code;

    if (code === 'P2002') {
      throw new ConflictException(
        action === 'create'
          ? 'A member with that email already exists'
          : 'Another member already uses that email',
      );
    }
    if (code === 'P2003') {
      throw new BadRequestException('Invalid reference id');
    }

    throw error;
  }
}
