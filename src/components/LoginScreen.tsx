import React, { useState } from 'react';
import type { GuildMember } from '../types.ts';
import { Sprout, Lock, UserPlus, KeyRound, Sparkles, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  members: GuildMember[];
  onLogin: (memberId: string, pin: string) => Promise<void>;
  onRegister: (name: string, pin: string, gameId?: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  members,
  onLogin,
  onRegister,
  isLoading,
}) => {
  const [selectedMode, setSelectedMode] = useState<string>(members.length > 0 ? members[0].id : 'NEW_USER');
  const [newName, setNewName] = useState('');
  const [newGameId, setNewGameId] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (members.length === 0) {
      setSelectedMode('NEW_USER');
    } else if (selectedMode !== 'NEW_USER' && !members.some((m) => m.id === selectedMode)) {
      setSelectedMode(members[0].id);
    }
  }, [members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setErrorMsg('กรุณากรอกรหัสผ่านเป็นตัวเลข 4 หลัก');
      return;
    }

    try {
      if (selectedMode === 'NEW_USER') {
        const trimmed = newName.trim();
        if (!trimmed) {
          setErrorMsg('กรุณากรอกชื่อตัวละครของคุณ');
          return;
        }
        await onRegister(trimmed, pin, newGameId.trim());
      } else {
        await onLogin(selectedMode, pin);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const selectedMember = members.find((m) => m.id === selectedMode);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#E6E2D6] relative overflow-hidden">
        {/* Decorative corner greenery */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7A8A5B]/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#DDA15E]/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-8 relative">
          <div className="w-20 h-20 rounded-2xl bg-[#F4F7F2] border border-[#7A8A5B]/30 flex items-center justify-center mx-auto mb-4 text-[#7A8A5B] shadow-xs">
            <Sprout className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-head text-[#4A5338] tracking-wide">
            สวนดอกไม้กิลด์
          </h1>
          <p className="text-sm text-[#8B7355] mt-1">
            สมุดสะสมพรรณไม้ &bull; โลกสวนดอกไม้
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-[#B56576]/10 border border-[#B56576]/30 rounded-xl flex items-center gap-2.5 text-[#B56576] text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold font-head text-[#8B7355] mb-2 uppercase tracking-wider">
              เข้าใช้งานในชื่อตัวละคร
            </label>
            <div className="relative">
              <select
                value={selectedMode}
                onChange={(e) => {
                  setSelectedMode(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-3.5 py-3 text-sm font-medium text-[#4A5338] focus:outline-none focus:border-[#7A8A5B] focus:ring-1 focus:ring-[#7A8A5B] appearance-none transition-all pr-10"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    👤 {m.name} {m.gameId ? `(ID: ${m.gameId})` : ''} - {m.flowers?.length || 0} ดอก
                  </option>
                ))}
                <option value="NEW_USER" className="font-semibold text-[#7A8A5B]">
                  ✨ + ลงทะเบียนชื่อใหม่ (นักปลูกคนใหม่)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#7A8A5B]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* New Member Name & Game ID Inputs */}
          {selectedMode === 'NEW_USER' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold font-head text-[#7A8A5B] mb-1.5 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>ชื่อตัวละครในเกม โลกสวนดอกไม้ <span className="text-[#B56576]">*</span></span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น เจ้าหญิงดอกไม้, กรีนทัมบ์..."
                  maxLength={30}
                  required
                  className="w-full bg-white border-2 border-[#7A8A5B]/40 rounded-xl px-4 py-3 text-sm font-medium text-[#4A5338] placeholder-[#8B7355]/40 focus:outline-none focus:border-[#7A8A5B] focus:ring-2 focus:ring-[#7A8A5B]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold font-head text-[#8B7355] mb-1.5 flex items-center gap-1.5">
                  <span>ไอดีเกม (In-Game ID)</span>
                  <span className="text-[10px] text-[#8B7355]/60 font-normal">(ไม่บังคับ กรอกเพื่อเพื่อนแอดได้)</span>
                </label>
                <input
                  type="text"
                  value={newGameId}
                  onChange={(e) => setNewGameId(e.target.value)}
                  placeholder="เช่น 100482 หรือ #GARDEN77"
                  maxLength={30}
                  className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-4 py-2.5 text-sm font-medium text-[#4A5338] placeholder-[#8B7355]/40 focus:outline-none focus:border-[#7A8A5B] transition-all"
                />
              </div>
            </div>
          )}

          {/* 4-digit PIN */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold font-head text-[#8B7355] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>รหัสผ่าน 4 หลัก</span>
              </label>
              <span className="text-[11px] text-[#8B7355]/70">
                {selectedMode === 'NEW_USER' ? 'ตั้งรหัสเฉพาะตัวของคุณ' : 'กรอกรหัสของคุณ'}
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                }}
                placeholder="••••"
                required
                className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-4 py-3 text-center tracking-[0.8em] text-xl font-bold text-[#4A5338] placeholder-[#8B7355]/30 focus:outline-none focus:border-[#7A8A5B] focus:ring-1 focus:ring-[#7A8A5B] transition-all"
              />
              <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-[#8B7355]/50 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#8B7355]/80 mt-2 text-center">
              🔒 รหัสผ่าน 4 หลักป้องกันไม่ให้ผู้อื่นแก้ไขรายการดอกไม้ของคุณ
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || pin.length !== 4 || (selectedMode === 'NEW_USER' && !newName.trim())}
              className="w-full bg-[#7A8A5B] hover:bg-[#4A5338] disabled:bg-[#D9D3C3] disabled:cursor-not-allowed text-white font-head font-medium py-3.5 rounded-xl transition-all shadow-sm hover:shadow flex justify-center items-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedMode === 'NEW_USER'
                      ? 'ลงทะเบียนและเข้าสู่สวนดอกไม้'
                      : `เข้าสู่สวนดอกไม้ (${selectedMember?.name || ''})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick select avatars for quick switching */}
        {members.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#E6E2D6]">
            <p className="text-[11px] font-head text-[#8B7355] text-center mb-3 uppercase tracking-wider">
              สมาชิกกิลด์ในระบบ ({members.length} คน)
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center max-h-28 overflow-y-auto pr-1">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMode(m.id);
                    setPin('');
                    setErrorMsg(null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    selectedMode === m.id
                      ? 'bg-[#7A8A5B] text-white border-[#7A8A5B]'
                      : 'bg-[#FAF8F5] text-[#4A5338] border-[#E6E2D6] hover:border-[#7A8A5B]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                  <span className="font-medium truncate max-w-[120px]">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
