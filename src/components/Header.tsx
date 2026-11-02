import React from 'react';
import type { GuildMember } from '../types.ts';
import { Sprout, LogOut, Shield, Flower2, Users } from 'lucide-react';

interface HeaderProps {
  currentUser: GuildMember | null;
  activeTab: 'myFlowers' | 'guild' | 'admin';
  setActiveTab: (tab: 'myFlowers' | 'guild' | 'admin') => void;
  onLogout: () => void;
  onRequestAdmin: () => void;
  isAdminUnlocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onRequestAdmin,
  isAdminUnlocked,
}) => {
  return (
    <header className="bg-white border-b border-[#E6E2D6] sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E6E2D6] flex items-center justify-center text-[#7A8A5B] shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-head text-[#4A5338] leading-tight flex items-center gap-1.5">
                สวนดอกไม้กิลด์
              </h1>
              <p className="text-xs text-[#8B7355]">สมุดสะสมพรรณไม้ &bull; โลกสวนดอกไม้</p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#84A98C]"></span>
                  <span className="text-sm font-semibold font-head text-[#4A5338] max-w-[130px] truncate">
                    {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[11px] text-[#8B7355] hover:text-[#B56576] flex items-center gap-1 justify-end ml-auto transition-colors mt-0.5"
                  title="เปลี่ยนผู้ใช้งาน / ออกจากระบบ"
                >
                  <LogOut className="w-3 h-3" />
                  <span>สลับผู้ใช้</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E6E2D6] -mb-[1px]">
          <button
            onClick={() => setActiveTab('myFlowers')}
            className={`flex-1 py-3 px-2 text-center text-sm font-medium font-head transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'myFlowers'
                ? 'text-[#4A5338] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-[3px] after:bg-[#7A8A5B] after:rounded-t-full'
                : 'text-[#8B7355] hover:text-[#4A5338]'
            }`}
          >
            <Flower2 className={`w-4 h-4 ${activeTab === 'myFlowers' ? 'text-[#7A8A5B]' : ''}`} />
            <span>ดอกไม้ของฉัน</span>
          </button>

          <button
            onClick={() => setActiveTab('guild')}
            className={`flex-1 py-3 px-2 text-center text-sm font-medium font-head transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'guild'
                ? 'text-[#4A5338] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-[3px] after:bg-[#7A8A5B] after:rounded-t-full'
                : 'text-[#8B7355] hover:text-[#4A5338]'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'guild' ? 'text-[#7A8A5B]' : ''}`} />
            <span>ภาพรวมกิลด์</span>
          </button>

          <button
            onClick={() => {
              if (isAdminUnlocked) {
                setActiveTab('admin');
              } else {
                onRequestAdmin();
              }
            }}
            className={`flex-1 py-3 px-2 text-center text-sm font-medium font-head transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'admin'
                ? 'text-[#4A5338] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-[3px] after:bg-[#7A8A5B] after:rounded-t-full'
                : 'text-[#8B7355] hover:text-[#4A5338]'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'admin' ? 'text-[#7A8A5B]' : ''}`} />
            <span>จัดการระบบ</span>
            {isAdminUnlocked && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#84A98C]"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
