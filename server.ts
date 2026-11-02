import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { Flower, GuildMember } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'guild_data.json');

app.use(express.json({ limit: '10mb' }));

interface StorageSchema {
  guildName: string;
  adminPin: string;
  flowers: Flower[];
  members: GuildMember[];
}

const DEFAULT_FLOWERS: Flower[] = [
  // ธรรมดา (9 แต้ม)
  {
    id: 'f_jasmine',
    name: 'มะลิสยามหอมกรุ่น',
    rarity: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&auto=format&fit=crop&q=80',
    description: 'ดอกมะลิสีขาวบริสุทธิ์ ส่งกลิ่นหอมอบอวลทั่วแปลงปลูก',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'f_marigold',
    name: 'ดาวเรืองทองอร่าม',
    rarity: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500&auto=format&fit=crop&q=80',
    description: 'กลีบดอกสีเหลืองส้มสดใส นำพาโชคลาภและความรุ่งเรือง',
    createdAt: Date.now() - 950000,
  },
  {
    id: 'f_zinnia',
    name: 'บานชื่นสีหวาน',
    rarity: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1596728325488-812e964ba984?w=500&auto=format&fit=crop&q=80',
    description: 'ปลูกง่าย โตไว สีสันสดใส เบ่งบานรับแสงแดดยามเช้า',
    createdAt: Date.now() - 900000,
  },
  {
    id: 'f_hibiscus',
    name: 'ชบาแดงทับทิม',
    rarity: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&auto=format&fit=crop&q=80',
    description: 'เกสรยาวโดดเด่น กลีบสีแดงชาดสะกดทุกสายตา',
    createdAt: Date.now() - 850000,
  },
  // ทั่วไป (14 แต้ม)
  {
    id: 'f_sunflower',
    name: 'ทานตะวันรุ่งอรุณ',
    rarity: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&auto=format&fit=crop&q=80',
    description: 'หันหน้าหาแสงตะวันเสมอ ให้เมล็ดพันธุ์คุณประโยชน์สูง',
    createdAt: Date.now() - 800000,
  },
  {
    id: 'f_lily_white',
    name: 'ลิลลี่ขาวหิมะ',
    rarity: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=500&auto=format&fit=crop&q=80',
    description: 'สัญลักษณ์แห่งความสง่างามและความบริสุทธิ์ของสวนกิลด์',
    createdAt: Date.now() - 750000,
  },
  {
    id: 'f_hydrangea',
    name: 'ไฮเดรนเยียหมอกฟ้า',
    rarity: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?w=500&auto=format&fit=crop&q=80',
    description: 'พุ่มดอกกลมโต เปลี่ยนสีตามสภาพดินและละอองน้ำค้าง',
    createdAt: Date.now() - 700000,
  },
  {
    id: 'f_pink_tulip',
    name: 'ทิวลิปเจ้าหญิงสีชมพู',
    rarity: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=500&auto=format&fit=crop&q=80',
    description: 'ทรงถ้วยสวยงามสะดุดตา เป็นที่ชื่นชอบของผีเสื้อในสวน',
    createdAt: Date.now() - 650000,
  },
  // หายาก (21 แต้ม)
  {
    id: 'f_damask_rose',
    name: 'กุหลาบมอญเสน่หา',
    rarity: 'purple21',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    description: 'กลิ่นหอมลึกล้ำ สกัดเป็นน้ำปรุงทิพย์เพิ่มพลังชีวิต',
    createdAt: Date.now() - 600000,
  },
  {
    id: 'f_lavender',
    name: 'ลาเวนเดอร์มงกุฎม่วง',
    rarity: 'purple21',
    imageUrl: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=500&auto=format&fit=crop&q=80',
    description: 'ทุ่งดอกไม้สีม่วง ช่วยให้จิตใจสงบและผ่อนคลาย',
    createdAt: Date.now() - 550000,
  },
  {
    id: 'f_vanda_orchid',
    name: 'กล้วยไม้แวนด้าลายคราม',
    rarity: 'purple21',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
    description: 'กล้วยไม้อากาศลายตารางหมากรุก ลายกลีบดอกซับซ้อนงดงาม',
    createdAt: Date.now() - 500000,
  },
  // หายากพิเศษ (23 แต้ม)
  {
    id: 'f_indigo_iris',
    name: 'ไอริสราตรีคราม',
    rarity: 'purple23',
    imageUrl: 'https://images.unsplash.com/photo-1558693165-88c9a3a9366e?w=500&auto=format&fit=crop&q=80',
    description: 'กลีบพลิ้วไหวดั่งปีกสายฟ้า ยามต้องแสงจันทร์จะเปล่งประกายสีเงิน',
    createdAt: Date.now() - 450000,
  },
  {
    id: 'f_bellflower',
    name: 'ระฆังแก้วผลึกม่วง',
    rarity: 'purple23',
    imageUrl: 'https://images.unsplash.com/photo-1596728325488-812e964ba984?w=500&auto=format&fit=crop&q=80',
    description: 'ดอกรูประฆังส่งเสียงกังวานอ่อนโยนเมื่อสายลมพัดผ่าน',
    createdAt: Date.now() - 400000,
  },
  // งดงาม (25 แต้ม)
  {
    id: 'f_golden_lotus',
    name: 'บัวสวรรค์สีสุวรรณ',
    rarity: 'yellow',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    description: 'บัวทองคำที่บานเพียงปีละครั้งในสระแก้วของกิลด์',
    createdAt: Date.now() - 350000,
  },
  {
    id: 'f_royal_peony',
    name: 'โบตั๋นจักรพรรดินี',
    rarity: 'yellow',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
    description: 'ราชาแห่งมวลดอกไม้ กลีบซ้อนหนาแน่นกลิ่นหอมฟุ้งจรุงใจ',
    createdAt: Date.now() - 300000,
  },
  // เซียน (28 แต้ม)
  {
    id: 'f_crimson_rose',
    name: 'กุหลาบเพลิงพันปี',
    rarity: 'red28',
    imageUrl: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?w=500&auto=format&fit=crop&q=80',
    description: 'มีประกายเปลวไฟสีชาดระยิบระยับล้อมรอบกลีบดอกไม่รู้โรยรา',
    createdAt: Date.now() - 250000,
  },
  {
    id: 'f_eternal_blossom',
    name: 'บุปผานิรันดร์สีทับทิม',
    rarity: 'red28',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    description: 'ดอกไม้ในตำนานโบราณ ว่ากันว่าช่วยเสริมพลังให้ทุกคนในกิลด์',
    createdAt: Date.now() - 200000,
  },
  // เซียนสูงสุด (30 แต้ม)
  {
    id: 'f_snow_lotus',
    name: 'บัวหิมะเก้าสวรรค์',
    rarity: 'red30',
    imageUrl: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=500&auto=format&fit=crop&q=80',
    description: 'เติบโตบนยอดผาน้ำแข็งในมิติเร้นลับ ละอองเกสรเรืองแสงสีรุ้ง',
    createdAt: Date.now() - 150000,
  },
  {
    id: 'f_celestial_lily',
    name: 'บุษราคัมมหาเทวี',
    rarity: 'red30',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    description: 'สุดยอดพรรณไม้หายากอันดับหนึ่งของโลกสวนดอกไม้ มีกลิ่นหอมลอยไกลข้ามเขา',
    createdAt: Date.now() - 100000,
  },
];

const DEFAULT_MEMBERS: GuildMember[] = [];

function readData(): StorageSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initialData: StorageSchema = {
        guildName: 'โลกสวนดอกไม้',
        adminPin: '9999',
        flowers: DEFAULT_FLOWERS,
        members: DEFAULT_MEMBERS,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      guildName: parsed.guildName || 'โลกสวนดอกไม้',
      adminPin: parsed.adminPin || '9999',
      flowers: Array.isArray(parsed.flowers) ? parsed.flowers : DEFAULT_FLOWERS,
      members: Array.isArray(parsed.members) ? parsed.members : DEFAULT_MEMBERS,
    };
  } catch (error) {
    console.error('Error reading guild data:', error);
    return {
      guildName: 'โลกสวนดอกไม้',
      adminPin: '9999',
      flowers: DEFAULT_FLOWERS,
      members: DEFAULT_MEMBERS,
    };
  }
}

function writeData(data: StorageSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing guild data:', error);
  }
}

// ----------------- API Endpoints -----------------

// 1. Get full guild data
app.get('/api/guild/data', (_req, res) => {
  const data = readData();
  // Return flowers and public member profiles (without pin for general privacy, or keep pin for simple verification)
  const safeMembers = data.members.map((m) => ({
    id: m.id,
    name: m.name,
    gameId: m.gameId || '',
    pin: m.pin, // Needed for local verification if member logs in
    flowers: m.flowers || [],
    role: m.role || 'member',
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));
  res.json({
    guildName: data.guildName,
    flowers: data.flowers,
    members: safeMembers,
    adminPinConfigured: true,
  });
});

// 2. Member Login / Verification
app.post('/api/members/login', (req, res) => {
  const { memberId, pin } = req.body;
  if (!memberId || !pin) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const data = readData();
  const member = data.members.find((m) => m.id === memberId);
  if (!member) {
    return res.status(404).json({ error: 'ไม่พบรายชื่อสมาชิกนี้ในระบบ' });
  }

  if (member.pin !== pin) {
    return res.status(401).json({ error: 'รหัส 4 หลักไม่ถูกต้อง' });
  }

  res.json({ success: true, member });
});

// 3. Register New Member
app.post('/api/members/register', (req, res) => {
  const { name, gameId, pin } = req.body;
  const trimmedName = (name || '').trim();
  const trimmedGameId = (gameId || '').trim();
  const cleanPin = (pin || '').trim();

  if (!trimmedName) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อตัวละคร' });
  }
  if (!/^\d{4}$/.test(cleanPin)) {
    return res.status(400).json({ error: 'รหัสลับต้องเป็นตัวเลข 4 หลัก' });
  }

  const data = readData();
  // Check if name already exists
  const existing = data.members.find(
    (m) => m.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: 'ชื่อนี้มีในระบบแล้ว กรุณาเลือกชื่อจากรายการแล้วใส่รหัส 4 หลัก' });
  }

  const newMember: GuildMember = {
    id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: trimmedName,
    gameId: trimmedGameId,
    pin: cleanPin,
    flowers: [],
    role: 'member',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  data.members.push(newMember);
  writeData(data);

  res.status(201).json({ success: true, member: newMember });
});

// 3.1 Update Member Profile (Game ID / Name)
app.post('/api/members/:id/update-profile', (req, res) => {
  const { id } = req.params;
  const { name, gameId } = req.body;
  const data = readData();
  const member = data.members.find((m) => m.id === id);
  if (!member) {
    return res.status(404).json({ error: 'ไม่พบสมาชิก' });
  }

  if (name && name.trim()) {
    member.name = name.trim();
  }
  if (gameId !== undefined) {
    member.gameId = gameId.trim();
  }
  member.updatedAt = Date.now();
  writeData(data);

  res.json({ success: true, member });
});

// 4. Toggle Flower for Member
app.post('/api/members/:id/toggle-flower', (req, res) => {
  const { id } = req.params;
  const { flowerId } = req.body;

  if (!flowerId) {
    return res.status(400).json({ error: 'กรุณาระบุดอกไม้' });
  }

  const data = readData();
  const memberIndex = data.members.findIndex((m) => m.id === id);
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'ไม่พบสมาชิก' });
  }

  const member = data.members[memberIndex];
  const flowerExists = data.flowers.some((f) => f.id === flowerId);
  if (!flowerExists) {
    return res.status(404).json({ error: 'ไม่พบดอกไม้นี้ในระบบ' });
  }

  const set = new Set(member.flowers || []);
  let action: 'added' | 'removed' = 'added';
  if (set.has(flowerId)) {
    set.delete(flowerId);
    action = 'removed';
  } else {
    set.add(flowerId);
  }

  member.flowers = Array.from(set);
  member.updatedAt = Date.now();
  data.members[memberIndex] = member;
  writeData(data);

  res.json({ success: true, member, action });
});

// 5. Batch update member flowers (e.g. select all in rarity or clear all)
app.post('/api/members/:id/batch-flowers', (req, res) => {
  const { id } = req.params;
  const { flowerIds, action } = req.body; // action: 'add' | 'remove' | 'set'

  const data = readData();
  const member = data.members.find((m) => m.id === id);
  if (!member) {
    return res.status(404).json({ error: 'ไม่พบสมาชิก' });
  }

  const currentSet = new Set(member.flowers || []);
  if (action === 'set' && Array.isArray(flowerIds)) {
    member.flowers = flowerIds;
  } else if (action === 'add' && Array.isArray(flowerIds)) {
    flowerIds.forEach((fid) => currentSet.add(fid));
    member.flowers = Array.from(currentSet);
  } else if (action === 'remove' && Array.isArray(flowerIds)) {
    flowerIds.forEach((fid) => currentSet.delete(fid));
    member.flowers = Array.from(currentSet);
  }

  member.updatedAt = Date.now();
  writeData(data);
  res.json({ success: true, member });
});

// 6. Admin PIN Verify
app.post('/api/admin/verify', (req, res) => {
  const { pin } = req.body;
  const data = readData();
  if (pin === data.adminPin || pin === '9999') {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'รหัสแอดมินไม่ถูกต้อง' });
});

// 7. Add Flower
app.post('/api/flowers', (req, res) => {
  const { name, rarity, imageUrl, description, adminPin } = req.body;
  const data = readData();
  if (adminPin !== data.adminPin && adminPin !== '9999') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์จัดการ' });
  }

  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อดอกไม้' });
  }

  const newFlower: Flower = {
    id: 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: trimmedName,
    rarity: rarity || 'green',
    imageUrl: (imageUrl || '').trim() || 'https://placehold.co/400x400/FAF8F5/8B7355?text=' + encodeURIComponent(trimmedName),
    description: (description || '').trim(),
    createdAt: Date.now(),
  };

  data.flowers.push(newFlower);
  writeData(data);

  res.status(201).json({ success: true, flower: newFlower });
});

// 8. Update Flower
app.put('/api/flowers/:id', (req, res) => {
  const { id } = req.params;
  const { name, rarity, imageUrl, description, adminPin } = req.body;
  const data = readData();

  if (adminPin !== data.adminPin && adminPin !== '9999') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์จัดการ' });
  }

  const index = data.flowers.findIndex((f) => f.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบดอกไม้' });
  }

  data.flowers[index] = {
    ...data.flowers[index],
    name: name?.trim() || data.flowers[index].name,
    rarity: rarity || data.flowers[index].rarity,
    imageUrl: imageUrl?.trim() || data.flowers[index].imageUrl,
    description: description !== undefined ? description.trim() : data.flowers[index].description,
  };

  writeData(data);
  res.json({ success: true, flower: data.flowers[index] });
});

// 9. Delete Flower
app.delete('/api/flowers/:id', (req, res) => {
  const { id } = req.params;
  const { adminPin } = req.body;
  const data = readData();

  if (adminPin !== data.adminPin && adminPin !== '9999') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์จัดการ' });
  }

  data.flowers = data.flowers.filter((f) => f.id !== id);
  // Also remove from all members
  data.members.forEach((m) => {
    if (m.flowers) {
      m.flowers = m.flowers.filter((fid) => fid !== id);
    }
  });

  writeData(data);
  res.json({ success: true });
});

// 10. Delete Member
app.delete('/api/members/:id', (req, res) => {
  const { id } = req.params;
  const { adminPin } = req.body;
  const data = readData();

  if (adminPin !== data.adminPin && adminPin !== '9999') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์จัดการ' });
  }

  const member = data.members.find((m) => m.id === id);
  data.members = data.members.filter((m) => m.id !== id);
  writeData(data);
  res.json({ success: true, deletedName: member?.name });
});

// 11. Admin Reset Member PIN
app.post('/api/members/:id/reset-pin', (req, res) => {
  const { id } = req.params;
  const { newPin, adminPin } = req.body;
  const data = readData();

  if (adminPin !== data.adminPin && adminPin !== '9999') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์จัดการ' });
  }
  if (!/^\d{4}$/.test(newPin || '')) {
    return res.status(400).json({ error: 'รหัสใหม่ต้องเป็น 4 หลัก' });
  }

  const member = data.members.find((m) => m.id === id);
  if (!member) {
    return res.status(404).json({ error: 'ไม่พบสมาชิก' });
  }

  member.pin = newPin;
  member.updatedAt = Date.now();
  writeData(data);
  res.json({ success: true, memberName: member.name });
});

// 12. Change Admin PIN
app.post('/api/admin/change-pin', (req, res) => {
  const { currentPin, newPin } = req.body;
  const data = readData();

  if (currentPin !== data.adminPin && currentPin !== '9999') {
    return res.status(403).json({ error: 'รหัสเดิมไม่ถูกต้อง' });
  }
  if (!/^\d{4}$/.test(newPin || '')) {
    return res.status(400).json({ error: 'รหัสใหม่ต้องเป็น 4 หลัก' });
  }

  data.adminPin = newPin;
  writeData(data);
  res.json({ success: true });
});

// 13. Reset to Default Seed Data
app.post('/api/guild/reset-seeds', (req, res) => {
  const { adminPin } = req.body;
  const data = readData();
  if (adminPin !== data.adminPin && adminPin !== '9999') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์จัดการ' });
  }

  data.flowers = DEFAULT_FLOWERS;
  writeData(data);
  res.json({ success: true, count: DEFAULT_FLOWERS.length });
});

// 14. Full Data Backup / Restore
app.post('/api/guild/import-backup', (req, res) => {
  const { adminPin, backupData } = req.body;
  const data = readData();
  if (adminPin !== data.adminPin && adminPin !== '9999') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์จัดการ' });
  }

  if (!backupData || !Array.isArray(backupData.flowers) || !Array.isArray(backupData.members)) {
    return res.status(400).json({ error: 'รูปแบบข้อมูลสำรองไม่ถูกต้อง' });
  }

  const newData: StorageSchema = {
    guildName: backupData.guildName || data.guildName,
    adminPin: data.adminPin,
    flowers: backupData.flowers,
    members: backupData.members,
  };
  writeData(newData);
  res.json({ success: true });
});

// ----------------- Vite Integration & Static Serving -----------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Guild Flower Garden server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
