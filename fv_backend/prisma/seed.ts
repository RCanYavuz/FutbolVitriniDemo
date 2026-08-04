import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '../src/generated/prisma/client';
import { AccountStatus, Position, Role, SubRole } from '../src/generated/prisma/enums';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const BCRYPT_ROUNDS = 12;

/**
 * frontend'in mock hesaplariyla (fv_frontend/src/store/authStore.ts) birebir ayni
 * kullanicilar. Boylece frontend'in bilinen giris bilgileri backend'de de calisir.
 */
const seedUsers = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'demo-admin@futbolvitrini.local',
    displayName: 'Sistem Yöneticisi',
    role: Role.ADMIN,
    subRole: SubRole.ADMIN,
    avatarUrl:
      'https://ui-avatars.com/api/?name=Sistem+Yonetici&background=FF4842&color=fff&bold=true',
  },
  {
    username: 'scout',
    password: 'scout123',
    email: 'demo-scout@futbolvitrini.local',
    displayName: 'Ahmet Yılmaz',
    role: Role.CLUB,
    subRole: SubRole.SCOUT,
    organization: 'FC Porto B',
    avatarUrl:
      'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=00B0FF&color=fff&bold=true',
  },
  {
    username: 'coach',
    password: 'coach123',
    email: 'demo-coach@futbolvitrini.local',
    displayName: 'Fatih Terim',
    role: Role.CLUB,
    subRole: SubRole.COACH,
    avatarUrl:
      'https://ui-avatars.com/api/?name=Fatih+Terim&background=00E676&color=000&bold=true',
  },
  {
    username: 'player',
    password: 'player123',
    email: 'demo-player@futbolvitrini.local',
    displayName: 'Arda Güler',
    role: Role.PLAYER,
    subRole: SubRole.PLAYER,
    avatarUrl:
      'https://ui-avatars.com/api/?name=Arda+Guler&background=00E676&color=000&bold=true',
  },
];

/** Admin panelindeki onay tablosunu bos gostermemek icin ornek bekleyen basvurular. */
const pendingUsers = [
  { username: 'caner', displayName: 'Caner Erkin', email: 'caner@player.com', subRole: SubRole.PLAYER, role: Role.PLAYER },
  { username: 'mehmet', displayName: 'Mehmet Ali', email: 'mehmet@agency.com', subRole: SubRole.SCOUT, role: Role.CLUB },
];

interface SeedPlayer {
  name: string;
  age: number;
  position: Position;
  team: string;
  aiScore: number;
  matchPercentage: number | null;
  aiReasoning: string | null;
  imageUrl: string;
  pace: number;
  passing: number;
  defending: number;
  physical: number;
  tackling: number;
  vision: number;
  dribbling: number;
  shooting: number;
  sprintSpeed: number;
  shotPower: number;
  passingAcc: number;
}

async function seedUser(u: any) {
  return prisma.user.upsert({
    where: { username: u.username },
    update: {
      organization: u.organization || null,
    },
    create: {
      username: u.username,
      email: u.email,
      displayName: u.displayName,
      passwordHash: await hash(u.password, BCRYPT_ROUNDS),
      role: u.role,
      subRole: u.subRole,
      organization: u.organization || null,
      avatarUrl: u.avatarUrl,
      status: AccountStatus.ACTIVE,
    },
  });
}

async function main() {
  // ── Aktif kullanicilar ──
  const users = await Promise.all(seedUsers.map(seedUser));
  const admin = users[0];

  // ── Bekleyen basvurular ──
  for (const p of pendingUsers) {
    await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: {
        username: p.username,
        email: p.email,
        displayName: p.displayName,
        passwordHash: await hash('bekleyen123', BCRYPT_ROUNDS),
        role: p.role,
        subRole: p.subRole,
        status: AccountStatus.PENDING,
      },
    });
  }

  // ── Oyuncular (frontend mockData'dan uretildi) ──
  const players: SeedPlayer[] = JSON.parse(
    readFileSync(join(__dirname, 'seed-players.json'), 'utf8'),
  );

  for (const player of players) {
    const existing = await prisma.player.findFirst({ where: { name: player.name } });
    if (!existing) {
      await prisma.player.create({ data: { ...player, ownerId: admin.id } });
    }
  }

  console.log(
    `Seed tamam. ${users.length} aktif kullanici, ${pendingUsers.length} bekleyen, ${players.length} oyuncu.`,
  );
  console.log('Giris: admin/admin123 · scout/scout123 · coach/coach123 · player/player123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
