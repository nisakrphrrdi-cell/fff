import type { Flower, GuildMember, GuildDataResponse, RarityType } from '../types.ts';

const API_BASE = '/api';

export async function fetchGuildData(): Promise<GuildDataResponse> {
  const res = await fetch(`${API_BASE}/guild/data`);
  if (!res.ok) {
    throw new Error('ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้');
  }
  return res.json();
}

export async function loginMember(memberId: string, pin: string): Promise<GuildMember> {
  const res = await fetch(`${API_BASE}/members/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, pin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
  }
  return data.member;
}

export async function registerMember(name: string, pin: string, gameId?: string): Promise<GuildMember> {
  const res = await fetch(`${API_BASE}/members/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pin, gameId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ลงทะเบียนไม่สำเร็จ');
  }
  return data.member;
}

export async function updateMemberProfile(id: string, profile: { name?: string; gameId?: string }): Promise<GuildMember> {
  const res = await fetch(`${API_BASE}/members/${id}/update-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'อัปเดตข้อมูลไม่สำเร็จ');
  }
  return data.member;
}

export async function toggleMemberFlower(memberId: string, flowerId: string): Promise<{ member: GuildMember; action: 'added' | 'removed' }> {
  const res = await fetch(`${API_BASE}/members/${memberId}/toggle-flower`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flowerId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ไม่สามารถอัปเดตดอกไม้ได้');
  }
  return data;
}

export async function batchUpdateFlowers(memberId: string, flowerIds: string[], action: 'add' | 'remove' | 'set'): Promise<GuildMember> {
  const res = await fetch(`${API_BASE}/members/${memberId}/batch-flowers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flowerIds, action }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ไม่สามารถอัปเดตข้อมูลได้');
  }
  return data.member;
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  return res.ok;
}

export async function createFlower(flower: { name: string; rarity: RarityType; imageUrl: string; description?: string }, adminPin: string): Promise<Flower> {
  const res = await fetch(`${API_BASE}/flowers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...flower, adminPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'เพิ่มดอกไม้ไม่สำเร็จ');
  }
  return data.flower;
}

export async function updateFlower(id: string, flower: { name: string; rarity: RarityType; imageUrl: string; description?: string }, adminPin: string): Promise<Flower> {
  const res = await fetch(`${API_BASE}/flowers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...flower, adminPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'แก้ไขดอกไม้ไม่สำเร็จ');
  }
  return data.flower;
}

export async function deleteFlower(id: string, adminPin: string): Promise<void> {
  const res = await fetch(`${API_BASE}/flowers/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ลบดอกไม้ไม่สำเร็จ');
  }
}

export async function deleteMember(id: string, adminPin: string): Promise<string> {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ลบสมาชิกไม่สำเร็จ');
  }
  return data.deletedName;
}

export async function resetMemberPin(id: string, newPin: string, adminPin: string): Promise<string> {
  const res = await fetch(`${API_BASE}/members/${id}/reset-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPin, adminPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
  }
  return data.memberName;
}

export async function changeAdminPin(currentPin: string, newPin: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/change-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPin, newPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'เปลี่ยนรหัสแอดมินไม่สำเร็จ');
  }
}

export async function resetToDefaultSeeds(adminPin: string): Promise<number> {
  const res = await fetch(`${API_BASE}/guild/reset-seeds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'รีเซ็ตข้อมูลไม่สำเร็จ');
  }
  return data.count;
}

export async function importBackup(backupData: any, adminPin: string): Promise<void> {
  const res = await fetch(`${API_BASE}/guild/import-backup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ backupData, adminPin }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'นำเข้าข้อมูลไม่สำเร็จ');
  }
}
