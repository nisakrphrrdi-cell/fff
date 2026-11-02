import React, { useState } from 'react';
import type { Flower, GuildMember, RarityType } from '../types.ts';
import { RARITY_CONFIG } from '../types.ts';
import {
  ShieldAlert,
  PlusCircle,
  Trash2,
  Edit2,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Save,
  X,
  AlertTriangle,
  UserX,
  Sparkles,
} from 'lucide-react';

interface AdminTabProps {
  adminPin: string;
  flowers: Flower[];
  members: GuildMember[];
  onAddFlower: (flower: { name: string; rarity: RarityType; imageUrl: string; description?: string }) => Promise<void>;
  onUpdateFlower: (id: string, flower: { name: string; rarity: RarityType; imageUrl: string; description?: string }) => Promise<void>;
  onDeleteFlower: (id: string) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onResetMemberPin: (id: string, newPin: string) => Promise<void>;
  onChangeAdminPin: (currentPin: string, newPin: string) => Promise<void>;
  onResetSeeds: () => Promise<void>;
  onImportBackup: (data: any) => Promise<void>;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  adminPin,
  flowers,
  members,
  onAddFlower,
  onUpdateFlower,
  onDeleteFlower,
  onDeleteMember,
  onResetMemberPin,
  onChangeAdminPin,
  onResetSeeds,
  onImportBackup,
}) => {
  // New flower form
  const [flowerName, setFlowerName] = useState('');
  const [flowerRarity, setFlowerRarity] = useState<RarityType>('green');
  const [flowerImageUrl, setFlowerImageUrl] = useState('');
  const [flowerDesc, setFlowerDesc] = useState('');
  const [isAddingFlower, setIsAddingFlower] = useState(false);

  // Edit flower modal
  const [editingFlower, setEditingFlower] = useState<Flower | null>(null);

  // Reset PIN modal
  const [resetPinMember, setResetPinMember] = useState<GuildMember | null>(null);
  const [newMemberPin, setNewMemberPin] = useState('');

  // Delete Member confirmation
  const [memberToDelete, setMemberToDelete] = useState<string>('');

  // Change Admin Pin state
  const [currentAdminPinInput, setCurrentAdminPinInput] = useState('');
  const [newAdminPinInput, setNewAdminPinInput] = useState('');
  const [showChangePinSection, setShowChangePinSection] = useState(false);

  // Preset flower images for easy addition
  const PRESET_IMAGES = [
    { label: 'กุหลาบ', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80' },
    { label: 'บัวหลวง', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80' },
    { label: 'ทานตะวัน', url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&auto=format&fit=crop&q=80' },
    { label: 'ลาเวนเดอร์', url: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=500&auto=format&fit=crop&q=80' },
    { label: 'ไฮเดรนเยีย', url: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?w=500&auto=format&fit=crop&q=80' },
    { label: 'กล้วยไม้', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80' },
  ];

  const handleCreateFlowerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowerName.trim()) return;

    try {
      setIsAddingFlower(true);
      const img = flowerImageUrl.trim() || `https://placehold.co/400x400/FAF8F5/8B7355?text=${encodeURIComponent(flowerName.trim())}&font=Prompt`;
      await onAddFlower({
        name: flowerName.trim(),
        rarity: flowerRarity,
        imageUrl: img,
        description: flowerDesc.trim(),
      });
      setFlowerName('');
      setFlowerImageUrl('');
      setFlowerDesc('');
      setFlowerRarity('green');
    } finally {
      setIsAddingFlower(false);
    }
  };

  const handleUpdateFlowerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlower || !editingFlower.name.trim()) return;

    await onUpdateFlower(editingFlower.id, {
      name: editingFlower.name.trim(),
      rarity: editingFlower.rarity,
      imageUrl: editingFlower.imageUrl.trim(),
      description: editingFlower.description?.trim(),
    });
    setEditingFlower(null);
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinMember) return;
    if (!/^\d{4}$/.test(newMemberPin)) {
      alert('รหัสผ่านใหม่ต้องเป็นตัวเลข 4 หลัก');
      return;
    }
    await onResetMemberPin(resetPinMember.id, newMemberPin);
    setResetPinMember(null);
    setNewMemberPin('');
  };

  const handleChangeAdminPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newAdminPinInput)) {
      alert('รหัสผ่านแอดมินใหม่ต้องเป็นตัวเลข 4 หลัก');
      return;
    }
    await onChangeAdminPin(currentAdminPinInput, newAdminPinInput);
    setCurrentAdminPinInput('');
    setNewAdminPinInput('');
    setShowChangePinSection(false);
  };

  const handleExportBackup = () => {
    const backupObj = {
      guildName: 'โลกสวนดอกไม้',
      exportedAt: new Date().toISOString(),
      flowers,
      members,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guild_flowers_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (confirm('คุณต้องการนำเข้าข้อมูลสำรองนี้หรือไม่? (ข้อมูลปัจจุบันจะถูกแทนที่ด้วยข้อมูลจากไฟล์)')) {
          await onImportBackup(parsed);
        }
      } catch (err: any) {
        alert('ไฟล์ไม่ถูกต้อง: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Notice Banner */}
      <div className="bg-[#FAF8F5] border border-[#7A8A5B]/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7A8A5B] text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-head font-bold text-sm text-[#4A5338]">โหมดผู้ดูแลระบบกิลด์ (Admin)</h3>
            <p className="text-xs text-[#8B7355]">คุณสามารถเพิ่มพรรณไม้ แก้ไขคะแนน และจัดการสมาชิกที่นี่</p>
          </div>
        </div>
        <button
          onClick={() => setShowChangePinSection(!showChangePinSection)}
          className="text-xs font-head text-[#7A8A5B] hover:text-[#4A5338] underline shrink-0"
        >
          {showChangePinSection ? 'ปิดเปลี่ยนรหัส' : 'เปลี่ยนรหัสแอดมิน'}
        </button>
      </div>

      {/* Change Admin PIN Accordion */}
      {showChangePinSection && (
        <form onSubmit={handleChangeAdminPinSubmit} className="bg-white p-5 rounded-2xl border border-[#E6E2D6] space-y-4">
          <h4 className="font-head font-bold text-[#4A5338] text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7A8A5B]" />
            <span>เปลี่ยนรหัสผ่านแอดมิน (PIN 4 หลัก)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-head text-[#8B7355] mb-1">รหัสแอดมินปัจจุบัน</label>
              <input
                type="password"
                maxLength={4}
                value={currentAdminPinInput}
                onChange={(e) => setCurrentAdminPinInput(e.target.value)}
                placeholder="รหัสปัจจุบัน (ค่าเริ่มต้น 9999)"
                required
                className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3 py-2 text-sm text-[#4A5338]"
              />
            </div>
            <div>
              <label className="block text-xs font-head text-[#8B7355] mb-1">รหัสแอดมินใหม่ (4 หลัก)</label>
              <input
                type="password"
                maxLength={4}
                value={newAdminPinInput}
                onChange={(e) => setNewAdminPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3 py-2 text-sm text-[#4A5338]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#7A8A5B] text-white rounded-xl text-xs font-head hover:bg-[#4A5338] transition-all"
          >
            บันทึกรหัสแอดมินใหม่
          </button>
        </form>
      )}

      {/* SECTION 1: Add New Flower Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E6E2D6]">
        <h2 className="font-head font-bold text-lg text-[#4A5338] mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-[#7A8A5B]" />
          <span>เพิ่มพรรณไม้ใหม่ลงสมุดกิลด์</span>
        </h2>

        <form onSubmit={handleCreateFlowerSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-head font-semibold text-[#8B7355] mb-1.5">
                ชื่อดอกไม้ <span className="text-[#B56576]">*</span>
              </label>
              <input
                type="text"
                value={flowerName}
                onChange={(e) => setFlowerName(e.target.value)}
                placeholder="เช่น บัวสวรรค์สีทอง, กุหลาบมอญ..."
                required
                className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3.5 py-2.5 text-sm text-[#4A5338] focus:outline-none focus:border-[#7A8A5B]"
              />
            </div>

            <div>
              <label className="block text-xs font-head font-semibold text-[#8B7355] mb-1.5">
                ระดับสายพันธุ์ & คะแนน <span className="text-[#B56576]">*</span>
              </label>
              <select
                value={flowerRarity}
                onChange={(e) => setFlowerRarity(e.target.value as RarityType)}
                className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3.5 py-2.5 text-sm text-[#4A5338] focus:outline-none focus:border-[#7A8A5B]"
              >
                <option value="green">🟢 ธรรมดา (9 คะแนน)</option>
                <option value="blue">🔵 ทั่วไป (14 คะแนน)</option>
                <option value="purple21">🟣 หายาก (21 คะแนน)</option>
                <option value="purple23">🟣 หายากพิเศษ (23 คะแนน)</option>
                <option value="yellow">🟡 งดงาม (25 คะแนน)</option>
                <option value="red28">🔴 เซียน (28 คะแนน)</option>
                <option value="red30">🔴 เซียนสูงสุด (30 คะแนน)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-head font-semibold text-[#8B7355] mb-1.5">
              ลิงก์รูปภาพ (Image URL)
            </label>
            <input
              type="url"
              value={flowerImageUrl}
              onChange={(e) => setFlowerImageUrl(e.target.value)}
              placeholder="https://... หรือคลิกเลือกรูปภาพตัวอย่างด้านล่าง"
              className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3.5 py-2.5 text-sm text-[#4A5338] focus:outline-none focus:border-[#7A8A5B]"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-[#8B7355]">ภาพตัวอย่างรวดเร็ว:</span>
              {PRESET_IMAGES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFlowerImageUrl(p.url)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-[#E6E2D6] text-[#4A5338] border border-[#E6E2D6] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-head font-semibold text-[#8B7355] mb-1.5">
              คำอธิบาย / รายละเอียดเพิ่มเติม (ไม่บังคับ)
            </label>
            <textarea
              rows={2}
              value={flowerDesc}
              onChange={(e) => setFlowerDesc(e.target.value)}
              placeholder="เช่น ดอกไม้ที่บานเฉพาะคืนจันทร์เต็มดวง..."
              className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3.5 py-2 text-sm text-[#4A5338] focus:outline-none focus:border-[#7A8A5B]"
            ></textarea>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isAddingFlower || !flowerName.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#7A8A5B] hover:bg-[#4A5338] text-white font-head font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAddingFlower ? 'กำลังบันทึก...' : 'ลงบันทึกพรรณไม้ใหม่'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Flower Catalog Management */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E6E2D6]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-head font-bold text-lg text-[#4A5338]">
            สมุดพรรณไม้ทั้งหมด ({flowers.length} ชนิด)
          </h2>
          <span className="text-xs text-[#8B7355]">แก้ไขหรือลบดอกไม้</span>
        </div>

        <div className="divide-y divide-[#FAF8F5] max-h-96 overflow-y-auto pr-1">
          {flowers.map((f) => {
            const conf = RARITY_CONFIG[f.rarity] || RARITY_CONFIG.green;
            return (
              <div key={f.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E6E2D6] shrink-0">
                    <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-head font-semibold text-sm text-[#4A5338] truncate">{f.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${conf.colorClass}`}></span>
                      <span className="text-[11px] text-[#8B7355]">
                        {conf.name} ({conf.points} แต้ม)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingFlower(f)}
                    className="p-1.5 text-[#8B7355] hover:text-[#7A8A5B] hover:bg-[#FAF8F5] rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`คุณแน่ใจหรือไม่ที่จะลบดอกไม้ "${f.name}" ออกจากระบบ?`)) {
                        onDeleteFlower(f.id);
                      }
                    }}
                    className="p-1.5 text-[#8B7355] hover:text-[#B56576] hover:bg-[#FAF8F5] rounded-lg transition-colors"
                    title="ลบดอกไม้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Guild Member Management */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E6E2D6]">
        <h2 className="font-head font-bold text-lg text-[#4A5338] mb-4">
          จัดการสมาชิกกิลด์ ({members.length} คน)
        </h2>

        <div className="space-y-3 mb-6">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D6] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white border border-[#E6E2D6] flex items-center justify-center font-head font-bold text-xs text-[#7A8A5B] shrink-0">
                  {m.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-head font-semibold text-sm text-[#4A5338] truncate">{m.name}</p>
                    {m.gameId && (
                      <span className="text-[10px] bg-white border border-[#E6E2D6] px-1.5 py-0.2 rounded font-mono text-[#8B7355]">
                        ID: {m.gameId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8B7355]">
                    สะสม {m.flowers?.length || 0} ดอก &bull; PIN: ••••
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setResetPinMember(m);
                    setNewMemberPin('');
                  }}
                  className="px-2.5 py-1.5 bg-white border border-[#E6E2D6] hover:border-[#7A8A5B] text-xs font-head text-[#7A8A5B] rounded-lg transition-colors flex items-center gap-1"
                  title="รีเซ็ตรหัส PIN 4 หลักของสมาชิกนี้"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>รีเซ็ต PIN</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบสมาชิก "${m.name}" ออกจากระบบกิลด์? ข้อมูลดอกไม้ของเขาจะหายไปด้วย`)) {
                      onDeleteMember(m.id);
                    }
                  }}
                  className="p-1.5 text-[#8B7355] hover:text-[#B56576] hover:bg-white rounded-lg transition-colors"
                  title="ลบสมาชิกออกจากกิลด์"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Member Dropdown from user's prototype */}
        <div className="p-4 rounded-2xl bg-[#B56576]/10 border border-[#B56576]/30">
          <h4 className="font-head font-bold text-sm text-[#B56576] flex items-center gap-1.5 mb-2">
            <UserX className="w-4 h-4" />
            <span>ลบรายชื่อผู้ที่ออกจากกิลด์</span>
          </h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={memberToDelete}
              onChange={(e) => setMemberToDelete(e.target.value)}
              className="flex-1 bg-white border border-[#E6E2D6] rounded-xl px-3 py-2 text-sm text-[#4A5338]"
            >
              <option value="">-- เลือกสมาชิกที่ต้องการลบ --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.gameId ? `[ID: ${m.gameId}]` : ''} ({m.flowers?.length || 0} ดอก)
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!memberToDelete) return;
                const m = members.find((x) => x.id === memberToDelete);
                if (m && confirm(`ยืนยันการลบ "${m.name}" ออกจากระบบกิลด์ถาวร?`)) {
                  onDeleteMember(m.id);
                  setMemberToDelete('');
                }
              }}
              disabled={!memberToDelete}
              className="px-4 py-2 bg-[#B56576] hover:bg-[#7A2E3E] disabled:opacity-40 text-white font-head text-xs font-semibold rounded-xl transition-all shrink-0"
            >
              ลบออกจากระบบถาวร
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Backup, Restore & Reset */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E6E2D6]">
        <h2 className="font-head font-bold text-lg text-[#4A5338] mb-4">
          สำรองข้อมูล & ตัวช่วยระบบ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D6] hover:border-[#7A8A5B] flex flex-col items-center text-center gap-2 transition-all group"
          >
            <Download className="w-5 h-5 text-[#7A8A5B] group-hover:scale-110 transition-transform" />
            <span className="font-head font-bold text-xs text-[#4A5338]">สำรองข้อมูล (Export JSON)</span>
            <span className="text-[11px] text-[#8B7355]">ดาวน์โหลดไฟล์สมุดกิลด์เก็บไว้</span>
          </button>

          <label className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D6] hover:border-[#7A8A5B] flex flex-col items-center text-center gap-2 transition-all group cursor-pointer">
            <Upload className="w-5 h-5 text-[#719FB0] group-hover:scale-110 transition-transform" />
            <span className="font-head font-bold text-xs text-[#4A5338]">กู้คืนข้อมูล (Import JSON)</span>
            <span className="text-[11px] text-[#8B7355]">นำเข้าไฟล์สำรองที่เคยบันทึกไว้</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('คุณต้องการรีเซ็ตพรรณไม้เป็นค่าเริ่มต้นมาตรฐานหรือไม่? (สมาชิกและข้อมูลจะยังคงอยู่)')) {
                onResetSeeds();
              }
            }}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D6] hover:border-[#DDA15E] flex flex-col items-center text-center gap-2 transition-all group"
          >
            <RefreshCw className="w-5 h-5 text-[#DDA15E] group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-head font-bold text-xs text-[#4A5338]">โหลดพรรณไม้เริ่มต้น</span>
            <span className="text-[11px] text-[#8B7355]">รีเซ็ตรายการดอกไม้มาตรฐาน 19 ชนิด</span>
          </button>
        </div>
      </div>

      {/* Edit Flower Modal */}
      {editingFlower && (
        <div className="fixed inset-0 z-50 bg-[#4A5338]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-[#E6E2D6] relative">
            <button
              onClick={() => setEditingFlower(null)}
              className="absolute top-4 right-4 text-[#8B7355] hover:text-[#4A5338]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-head font-bold text-lg text-[#4A5338] mb-4">
              แก้ไขข้อมูลดอกไม้
            </h3>

            <form onSubmit={handleUpdateFlowerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-head text-[#8B7355] mb-1">ชื่อดอกไม้</label>
                <input
                  type="text"
                  value={editingFlower.name}
                  onChange={(e) => setEditingFlower({ ...editingFlower, name: e.target.value })}
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3 py-2 text-sm text-[#4A5338]"
                />
              </div>

              <div>
                <label className="block text-xs font-head text-[#8B7355] mb-1">ระดับสายพันธุ์</label>
                <select
                  value={editingFlower.rarity}
                  onChange={(e) => setEditingFlower({ ...editingFlower, rarity: e.target.value as RarityType })}
                  className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3 py-2 text-sm text-[#4A5338]"
                >
                  <option value="green">🟢 ธรรมดา (9 คะแนน)</option>
                  <option value="blue">🔵 ทั่วไป (14 คะแนน)</option>
                  <option value="purple21">🟣 หายาก (21 คะแนน)</option>
                  <option value="purple23">🟣 หายากพิเศษ (23 คะแนน)</option>
                  <option value="yellow">🟡 งดงาม (25 คะแนน)</option>
                  <option value="red28">🔴 เซียน (28 คะแนน)</option>
                  <option value="red30">🔴 เซียนสูงสุด (30 คะแนน)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-head text-[#8B7355] mb-1">ลิงก์รูปภาพ (URL)</label>
                <input
                  type="url"
                  value={editingFlower.imageUrl}
                  onChange={(e) => setEditingFlower({ ...editingFlower, imageUrl: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3 py-2 text-sm text-[#4A5338]"
                />
              </div>

              <div>
                <label className="block text-xs font-head text-[#8B7355] mb-1">คำอธิบาย</label>
                <textarea
                  rows={2}
                  value={editingFlower.description || ''}
                  onChange={(e) => setEditingFlower({ ...editingFlower, description: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3 py-2 text-sm text-[#4A5338]"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFlower(null)}
                  className="flex-1 py-2.5 bg-[#FAF8F5] text-[#8B7355] rounded-xl text-xs font-head"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#7A8A5B] text-white rounded-xl text-xs font-head font-medium hover:bg-[#4A5338]"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset PIN Modal */}
      {resetPinMember && (
        <div className="fixed inset-0 z-50 bg-[#4A5338]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border border-[#E6E2D6] text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E6E2D6] flex items-center justify-center mx-auto mb-3 text-[#7A8A5B]">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-head font-bold text-base text-[#4A5338] mb-1">
              รีเซ็ตรหัสผ่านของ {resetPinMember.name}
            </h3>
            <p className="text-xs text-[#8B7355] mb-4">
              ตั้งรหัสลับ 4 หลักใหม่ให้สมาชิกกรณีเขาลืมรหัส
            </p>

            <form onSubmit={handleResetPinSubmit} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newMemberPin}
                onChange={(e) => setNewMemberPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-4 py-3 text-center tracking-[1em] text-xl font-bold text-[#4A5338] focus:outline-none focus:border-[#7A8A5B]"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetPinMember(null)}
                  className="flex-1 py-2.5 bg-[#FAF8F5] text-[#8B7355] rounded-xl text-xs font-head"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={newMemberPin.length !== 4}
                  className="flex-1 py-2.5 bg-[#7A8A5B] text-white rounded-xl text-xs font-head font-medium hover:bg-[#4A5338] disabled:opacity-40"
                >
                  ตั้งรหัสใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
