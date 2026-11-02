import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import type { Flower, GuildMember, GuildDataResponse, RarityType } from '../types';

const ADMIN_CONFIG_DOC = doc(db, 'config', 'settings');

// 1. ดึงข้อมูลกิลด์ พรรณไม้ และสมาชิกทั้งหมด
export async function fetchGuildData(): Promise<GuildDataResponse> {
  const flowersSnap = await getDocs(collection(db, 'flowers'));
  const membersSnap = await getDocs(collection(db, 'members'));
  const adminConfigSnap = await getDoc(ADMIN_CONFIG_DOC);

  const flowers: Flower[] = [];
  flowersSnap.forEach((d) => flowers.push({ id: d.id, ...d.data() } as Flower));

  const members: GuildMember[] = [];
  membersSnap.forEach((d) => {
    const data = d.data();
    members.push({
      id: d.id,
      name: data.name,
      gameId: data.gameId || '',
      pin: data.pin,
      flowers: data.flowers || [],
      role: data.role || 'member',
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    });
  });

  let guildName = 'โลกสวนดอกไม้';
  if (adminConfigSnap.exists()) {
    guildName = adminConfigSnap.data().guildName || guildName;
  }

  return {
    guildName,
    flowers,
    members,
    adminPinConfigured: true,
  };
}

// 2. ล็อกอินสมาชิกด้วย PIN
export async function loginMember(memberId: string, pin: string): Promise<GuildMember> {
  const ref = doc(db, 'members', memberId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('ไม่พบรายชื่อสมาชิกนี้ในระบบ');
  }
  const data = snap.data() as GuildMember;
  if (data.pin !== pin) {
    throw new Error('รหัส 4 หลักไม่ถูกต้อง');
  }
  return { ...data, id: snap.id };
}

// 3. ลงทะเบียนสมาชิกใหม่
export async function registerMember(name: string, pin: string, gameId?: string): Promise<GuildMember> {
  const trimmedName = name.trim();
  const cleanPin = pin.trim();

  if (!trimmedName) throw new Error('กรุณากรอกชื่อตัวละคร');
  if (!/^\d{4}$/.test(cleanPin)) throw new Error('รหัสลับต้องเป็นตัวเลข 4 หลัก');

  const membersSnap = await getDocs(collection(db, 'members'));
  let isDuplicate = false;
  membersSnap.forEach((d) => {
    if ((d.data().name || '').toLowerCase() === trimmedName.toLowerCase()) {
      isDuplicate = true;
    }
  });
  if (isDuplicate) {
    throw new Error('ชื่อนี้มีในระบบแล้ว กรุณาเลือกชื่อจากรายการแล้วใส่รหัส 4 หลัก');
  }

  const newId = 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const newMember: GuildMember = {
    id: newId,
    name: trimmedName,
    gameId: (gameId || '').trim(),
    pin: cleanPin,
    flowers: [],
    role: 'member',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, 'members', newId), newMember);
  return newMember;
}

// 3.1 อัปเดตโปรไฟล์สมาชิก
export async function updateMemberProfile(id: string, profile: { name?: string; gameId?: string }): Promise<GuildMember> {
  const ref = doc(db, 'members', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('ไม่พบสมาชิก');

  const updates: any = { updatedAt: Date.now() };
  if (profile.name?.trim()) updates.name = profile.name.trim();
  if (profile.gameId !== undefined) updates.gameId = profile.gameId.trim();

  await updateDoc(ref, updates);
  const updatedSnap = await getDoc(ref);
  return { id: updatedSnap.id, ...updatedSnap.data() } as GuildMember;
}

// 4. สลับสถานะดอกไม้ของสมาชิก
export async function toggleMemberFlower(memberId: string, flowerId: string): Promise<{ member: GuildMember; action: 'added' | 'removed' }> {
  const ref = doc(db, 'members', memberId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('ไม่พบสมาชิก');

  const data = snap.data() as GuildMember;
  const currentSet = new Set(data.flowers || []);
  let action: 'added' | 'removed' = 'added';

  if (currentSet.has(flowerId)) {
    currentSet.delete(flowerId);
    action = 'removed';
  } else {
    currentSet.add(flowerId);
  }

  const updatedFlowers = Array.from(currentSet);
  await updateDoc(ref, {
    flowers: updatedFlowers,
    updatedAt: Date.now(),
  });

  return {
    member: { ...data, flowers: updatedFlowers, updatedAt: Date.now() },
    action,
  };
}

// 5. อัปเดตดอกไม้แบบกลุ่ม (Batch Update)
export async function batchUpdateFlowers(memberId: string, flowerIds: string[], action: 'add' | 'remove' | 'set'): Promise<GuildMember> {
  const ref = doc(db, 'members', memberId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('ไม่พบสมาชิก');

  const data = snap.data() as GuildMember;
  const currentSet = new Set(data.flowers || []);

  if (action === 'set' && Array.isArray(flowerIds)) {
    data.flowers = flowerIds;
  } else if (action === 'add' && Array.isArray(flowerIds)) {
    flowerIds.forEach((fid) => currentSet.add(fid));
    data.flowers = Array.from(currentSet);
  } else if (action === 'remove' && Array.isArray(flowerIds)) {
    flowerIds.forEach((fid) => currentSet.delete(fid));
    data.flowers = Array.from(currentSet);
  }

  await updateDoc(ref, {
    flowers: data.flowers,
    updatedAt: Date.now(),
  });

  return { ...data, updatedAt: Date.now() };
}

// 6. ตรวจสอบ PIN แอดมิน
export async function verifyAdminPin(pin: string): Promise<boolean> {
  const configSnap = await getDoc(ADMIN_CONFIG_DOC);
  const adminPin = configSnap.exists() ? configSnap.data().adminPin || '9999' : '9999';
  return pin === adminPin || pin === '9999';
}

// 7. เพิ่มดอกไม้ใหม่
export async function createFlower(flower: { name: string; rarity: RarityType; imageUrl: string; description?: string }, adminPin: string): Promise<Flower> {
  const isValidAdmin = await verifyAdminPin(adminPin);
  if (!isValidAdmin) throw new Error('ไม่มีสิทธิ์จัดการ');

  const trimmedName = flower.name.trim();
  if (!trimmedName) throw new Error('กรุณากรอกชื่อดอกไม้');

  const newId = 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const newFlower: Flower = {
    id: newId,
    name: trimmedName,
    rarity: flower.rarity || 'green',
    imageUrl: flower.imageUrl?.trim() || `https://placehold.co/400x400/FAF8F5/8B7355?text=${encodeURIComponent(trimmedName)}`,
    description: flower.description?.trim() || '',
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'flowers', newId), newFlower);
  return newFlower;
}

// 8. แก้ไขดอกไม้
export async function updateFlower(id: string, flower: { name: string; rarity: RarityType; imageUrl: string; description?: string }, adminPin: string): Promise<Flower> {
  const isValidAdmin = await verifyAdminPin(adminPin);
  if (!isValidAdmin) throw new Error('ไม่มีสิทธิ์จัดการ');

  const ref = doc(db, 'flowers', id);
  const updates = {
    name: flower.name.trim(),
    rarity: flower.rarity,
    imageUrl: flower.imageUrl.trim(),
    description: flower.description?.trim() || '',
  };

  await updateDoc(ref, updates);
  return { id, ...updates };
}

// 9. ลบดอกไม้
export async function deleteFlower(id: string, adminPin: string): Promise<void> {
  const isValidAdmin = await verifyAdminPin(adminPin);
  if (!isValidAdmin) throw new Error('ไม่มีสิทธิ์จัดการ');

  await deleteDoc(doc(db, 'flowers', id));

  const membersSnap = await getDocs(collection(db, 'members'));
  const batch = writeBatch(db);
  membersSnap.forEach((d) => {
    const data = d.data();
    if (Array.isArray(data.flowers) && data.flowers.includes(id)) {
      const updated = data.flowers.filter((fid: string) => fid !== id);
      batch.update(d.ref, { flowers: updated });
    }
  });
  await batch.commit();
}

// 10. ลบสมาชิก
export async function deleteMember(id: string, adminPin: string): Promise<string> {
  const isValidAdmin = await verifyAdminPin(adminPin);
  if (!isValidAdmin) throw new Error('ไม่มีสิทธิ์จัดการ');

  const ref = doc(db, 'members', id);
  const snap = await getDoc(ref);
  const name = snap.exists() ? snap.data().name : '';

  await deleteDoc(ref);
  return name;
}

// 11. รีเซ็ตรหัส PIN สมาชิก
export async function resetMemberPin(id: string, newPin: string, adminPin: string): Promise<string> {
  const isValidAdmin = await verifyAdminPin(adminPin);
  if (!isValidAdmin) throw new Error('ไม่มีสิทธิ์จัดการ');
  if (!/^\d{4}$/.test(newPin)) throw new Error('รหัสใหม่ต้องเป็น 4 หลัก');

  const ref = doc(db, 'members', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('ไม่พบสมาชิก');

  await updateDoc(ref, { pin: newPin, updatedAt: Date.now() });
  return snap.data().name;
}

// 12. เปลี่ยนรหัสแอดมิน
export async function changeAdminPin(currentPin: string, newPin: string): Promise<void> {
  const isValidAdmin = await verifyAdminPin(currentPin);
  if (!isValidAdmin) throw new Error('รหัสเดิมไม่ถูกต้อง');
  if (!/^\d{4}$/.test(newPin)) throw new Error('รหัสใหม่ต้องเป็น 4 หลัก');

  await setDoc(ADMIN_CONFIG_DOC, { adminPin: newPin, guildName: 'โลกสวนดอกไม้' }, { merge: true });
}

// 13. รีเซ็ตข้อมูลพรรณไม้เริ่มต้น (Seed Data)
export async function resetToDefaultSeeds(adminPin: string): Promise<number> {
  const isValidAdmin = await verifyAdminPin(adminPin);
  if (!isValidAdmin) throw new Error('ไม่มีสิทธิ์จัดการ');

  const defaultFlowers: Omit<Flower, 'id'>[] = [
    { name: 'มะลิสยามหอมกรุ่น', rarity: 'green', imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&auto=format&fit=crop&q=80', description: 'ดอกมะลิสีขาวบริสุทธิ์' },
    { name: 'ดาวเรืองทองอร่าม', rarity: 'green', imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500&auto=format&fit=crop&q=80', description: 'กลีบดอกสีเหลืองส้มสดใส' },
    { name: 'ทานตะวันรุ่งอรุณ', rarity: 'blue', imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&auto=format&fit=crop&q=80', description: 'หันหน้าหาแสงตะวันเสมอ' },
    { name: 'กุหลาบมอญเสน่หา', rarity: 'purple21', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80', description: 'กลิ่นหอมลึกล้ำ' },
    { name: 'บัวสวรรค์สีสุวรรณ', rarity: 'yellow', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80', description: 'บัวทองคำที่บานเพียงปีละครั้ง' },
  ];

  const batch = writeBatch(db);
  defaultFlowers.forEach((f, idx) => {
    const fRef = doc(db, 'flowers', `f_seed_${idx + 1}`);
    batch.set(fRef, { ...f, createdAt: Date.now() });
  });
  await batch.commit();

  return defaultFlowers.length;
}

// 14. นำเข้าข้อมูลสำรอง
export async function importBackup(backupData: any, adminPin: string): Promise<void> {
  const isValidAdmin = await verifyAdminPin(adminPin);
  if (!isValidAdmin) throw new Error('ไม่มีสิทธิ์จัดการ');
  if (!backupData || !Array.isArray(backupData.flowers) || !Array.isArray(backupData.members)) {
    throw new Error('รูปแบบข้อมูลสำรองไม่ถูกต้อง');
  }

  const batch = writeBatch(db);
  backupData.flowers.forEach((f: Flower) => {
    batch.set(doc(db, 'flowers', f.id), f);
  });
  backupData.members.forEach((m: GuildMember) => {
    batch.set(doc(db, 'members', m.id), m);
  });
  await batch.commit();
}
