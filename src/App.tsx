import React, { useState, useEffect, useCallback } from 'react';
import type { Flower, GuildMember, RarityType } from './types.ts';
import {
  fetchGuildData,
  loginMember,
  registerMember,
  toggleMemberFlower,
  batchUpdateFlowers,
  verifyAdminPin,
  createFlower,
  updateFlower,
  deleteFlower,
  deleteMember,
  resetMemberPin,
  changeAdminPin,
  resetToDefaultSeeds,
  importBackup,
} from './services/api.ts';
import { Header } from './components/Header.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { MyFlowersTab } from './components/MyFlowersTab.tsx';
import { GuildOverviewTab } from './components/GuildOverviewTab.tsx';
import { AdminTab } from './components/AdminTab.tsx';
import { AdminPinModal } from './components/AdminPinModal.tsx';
import { FlowerDetailModal } from './components/FlowerDetailModal.tsx';
import { MemberDetailModal } from './components/MemberDetailModal.tsx';
import { Toast, type ToastMessage } from './components/Toast.tsx';
import { Sprout } from 'lucide-react';

const LOCAL_STORAGE_USER_KEY = 'guild_botanic_user_id';

export default function App() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [currentUser, setCurrentUser] = useState<GuildMember | null>(null);
  const [activeTab, setActiveTab] = useState<'myFlowers' | 'guild' | 'admin'>('myFlowers');

  // Admin state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('9999');
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);

  // Modal inspection states
  const [inspectedFlower, setInspectedFlower] = useState<Flower | null>(null);
  const [inspectedMember, setInspectedMember] = useState<GuildMember | null>(null);

  // UI status
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3000);
  }, []);

  // Initial Data Load
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchGuildData();
      setFlowers(data.flowers);
      setMembers(data.members);

      // Check remembered user
      const savedUserId = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUserId) {
        const found = data.members.find((m) => m.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        } else {
          setCurrentUser(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
      }
    } catch (err: any) {
      console.error('Failed to load guild data:', err);
      showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลกิลด์ได้', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Login
  const handleLogin = async (memberId: string, pin: string) => {
    setIsSubmitting(true);
    try {
      const member = await loginMember(memberId, pin);
      setCurrentUser(member);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, member.id);
      showToast(`ยินดีต้อนรับ ${member.name} เข้าสู่สวนดอกไม้!`);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register
  const handleRegister = async (name: string, pin: string, gameId?: string) => {
    setIsSubmitting(true);
    try {
      const member = await registerMember(name, pin, gameId);
      setMembers((prev) => [...prev, member]);
      setCurrentUser(member);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, member.id);
      showToast(`ลงทะเบียนนักปลูก ${member.name} สำเร็จ!`);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    showToast('ออกจากระบบแล้ว', 'info');
  };

  // Toggle Flower for Current Member
  const handleToggleFlower = async (flowerId: string) => {
    if (!currentUser) return;

    // Optimistic UI update
    const prevFlowers = [...(currentUser.flowers || [])];
    const isOwned = prevFlowers.includes(flowerId);
    const updatedFlowers = isOwned
      ? prevFlowers.filter((id) => id !== flowerId)
      : [...prevFlowers, flowerId];

    const updatedMember = { ...currentUser, flowers: updatedFlowers };
    setCurrentUser(updatedMember);
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));

    try {
      await toggleMemberFlower(currentUser.id, flowerId);
      const flowerObj = flowers.find((f) => f.id === flowerId);
      const name = flowerObj?.name || 'ดอกไม้';
      if (!isOwned) {
        showToast(`บันทึกพบ ${name} แล้ว ✨`);
      } else {
        showToast(`นำ ${name} ออกจากรายการแล้ว`, 'info');
      }
    } catch (err: any) {
      // Revert on error
      const reverted = { ...currentUser, flowers: prevFlowers };
      setCurrentUser(reverted);
      setMembers((prev) => prev.map((m) => (m.id === reverted.id ? reverted : m)));
      showToast('ไม่สามารถบันทึกได้: ' + err.message, 'error');
    }
  };

  // Batch Update Flowers
  const handleBatchUpdate = async (flowerIds: string[], action: 'add' | 'remove') => {
    if (!currentUser) return;
    try {
      const updated = await batchUpdateFlowers(currentUser.id, flowerIds, action);
      setCurrentUser(updated);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      showToast(action === 'add' ? 'บันทึกเลือกทั้งหมดแล้ว' : 'ล้างการเลือกแล้ว');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Verify Admin PIN
  const handleVerifyAdminPin = async (inputPin: string) => {
    const isValid = await verifyAdminPin(inputPin);
    if (isValid) {
      setIsAdminUnlocked(true);
      setAdminPin(inputPin);
      setActiveTab('admin');
      showToast('ยืนยันตัวตนแอดมินสำเร็จ 🛡️');
      return true;
    }
    return false;
  };

  // Admin Add Flower
  const handleAddFlower = async (flowerData: {
    name: string;
    rarity: RarityType;
    imageUrl: string;
    description?: string;
  }) => {
    try {
      const newFlower = await createFlower(flowerData, adminPin);
      setFlowers((prev) => [newFlower, ...prev]);
      showToast(`เพิ่มพรรณไม้ "${newFlower.name}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Admin Update Flower
  const handleUpdateFlower = async (
    id: string,
    flowerData: { name: string; rarity: RarityType; imageUrl: string; description?: string }
  ) => {
    try {
      const updated = await updateFlower(id, flowerData, adminPin);
      setFlowers((prev) => prev.map((f) => (f.id === id ? updated : f)));
      showToast(`แก้ไขข้อมูล "${updated.name}" แล้ว`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Admin Delete Flower
  const handleDeleteFlower = async (id: string) => {
    try {
      await deleteFlower(id, adminPin);
      setFlowers((prev) => prev.filter((f) => f.id !== id));
      // Remove from members
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          flowers: (m.flowers || []).filter((fid) => fid !== id),
        }))
      );
      if (currentUser) {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                flowers: (prev.flowers || []).filter((fid) => fid !== id),
              }
            : null
        );
      }
      showToast('ลบพรรณไม้ออกจากระบบแล้ว');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Admin Delete Member
  const handleDeleteMember = async (id: string) => {
    try {
      const deletedName = await deleteMember(id, adminPin);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (currentUser?.id === id) {
        handleLogout();
      }
      showToast(`ลบสมาชิก "${deletedName || 'ผู้ใช้'}" ออกจากกิลด์แล้ว`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Admin Reset Member PIN
  const handleResetMemberPin = async (id: string, newPin: string) => {
    try {
      const memberName = await resetMemberPin(id, newPin, adminPin);
      showToast(`ตั้งรหัสผ่านใหม่ให้ ${memberName} เรียบร้อยแล้ว`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Admin Change Admin PIN
  const handleChangeAdminPin = async (currentPin: string, newPin: string) => {
    try {
      await changeAdminPin(currentPin, newPin);
      setAdminPin(newPin);
      showToast('เปลี่ยนรหัสผ่านแอดมินใหม่เรียบร้อยแล้ว');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Reset Seeds
  const handleResetSeeds = async () => {
    try {
      const count = await resetToDefaultSeeds(adminPin);
      await loadData();
      showToast(`รีเซ็ตรายการดอกไม้เริ่มต้น ${count} ชนิดแล้ว`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Import Backup
  const handleImportBackup = async (backupData: any) => {
    try {
      await importBackup(backupData, adminPin);
      await loadData();
      showToast('นำเข้าข้อมูลสำรองสำเร็จแล้ว');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Loading state screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E6E2D6] flex items-center justify-center text-[#7A8A5B] shadow-sm mb-4 animate-bounce">
          <Sprout className="w-8 h-8" />
        </div>
        <div className="w-8 h-8 border-3 border-[#E6E2D6] border-t-[#7A8A5B] rounded-full animate-spin mb-3"></div>
        <h2 className="font-head font-bold text-lg text-[#4A5338]">กำลังเตรียมสวนดอกไม้...</h2>
        <p className="text-xs text-[#8B7355]">โหลดข้อมูลสมาชิกและพรรณไม้ของกิลด์</p>
      </div>
    );
  }

  // If not logged in, show Login / Registration screen
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          members={members}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isSubmitting}
        />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col selection:bg-[#7A8A5B] selection:text-white">
      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onRequestAdmin={() => setShowAdminPinModal(true)}
        isAdminUnlocked={isAdminUnlocked}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {activeTab === 'myFlowers' && (
          <MyFlowersTab
            currentUser={currentUser}
            flowers={flowers}
            onToggleFlower={handleToggleFlower}
            onBatchUpdate={handleBatchUpdate}
            onInspectFlower={(f) => setInspectedFlower(f)}
          />
        )}

        {activeTab === 'guild' && (
          <GuildOverviewTab
            flowers={flowers}
            members={members}
            currentUserId={currentUser.id}
            onInspectFlower={(f) => setInspectedFlower(f)}
            onSelectMember={(m) => setInspectedMember(m)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab
            adminPin={adminPin}
            flowers={flowers}
            members={members}
            onAddFlower={handleAddFlower}
            onUpdateFlower={handleUpdateFlower}
            onDeleteFlower={handleDeleteFlower}
            onDeleteMember={handleDeleteMember}
            onResetMemberPin={handleResetMemberPin}
            onChangeAdminPin={handleChangeAdminPin}
            onResetSeeds={handleResetSeeds}
            onImportBackup={handleImportBackup}
          />
        )}
      </main>

      {/* Admin Unlock Modal */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        onClose={() => setShowAdminPinModal(false)}
        onVerify={handleVerifyAdminPin}
      />

      {/* Flower Details Modal */}
      <FlowerDetailModal
        flower={inspectedFlower}
        onClose={() => setInspectedFlower(null)}
        members={members}
        currentUserId={currentUser?.id}
        onToggleMyFlower={currentUser ? handleToggleFlower : undefined}
      />

      {/* Member Details Modal */}
      <MemberDetailModal
        member={inspectedMember}
        flowers={flowers}
        onClose={() => setInspectedMember(null)}
        onInspectFlower={(f) => setInspectedFlower(f)}
      />
    </div>
  );
}
