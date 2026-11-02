import React, { useState } from 'react';
import { Shield, KeyRound, X } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onVerify,
}) => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (pin.length !== 4) {
      setErrorMsg('กรุณากรอกรหัส 4 หลัก');
      return;
    }

    try {
      setIsVerifying(true);
      const success = await onVerify(pin);
      if (success) {
        setPin('');
        onClose();
      } else {
        setErrorMsg('รหัสผ่านแอดมินไม่ถูกต้อง (ค่าเริ่มต้น: 9999)');
        setPin('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'รหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#4A5338]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-[#E6E2D6] relative animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8B7355] hover:text-[#4A5338] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#7A8A5B]/30 flex items-center justify-center mx-auto mb-3 text-[#7A8A5B] shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="font-head font-bold text-lg text-[#4A5338]">ยืนยันตัวตนแอดมิน</h3>
          <p className="text-xs text-[#8B7355] mt-1">กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบจัดการกิลด์</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-[#B56576]/10 border border-[#B56576]/30 rounded-xl text-center text-xs text-[#B56576] font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPin(val);
                setErrorMsg(null);
              }}
              placeholder="••••"
              required
              className="w-full bg-[#FAF8F5] border border-[#E6E2D6] rounded-xl px-4 py-3 text-center tracking-[1em] text-2xl font-bold text-[#4A5338] focus:outline-none focus:border-[#7A8A5B] focus:ring-1 focus:ring-[#7A8A5B] transition-all"
            />
            <KeyRound className="absolute right-3.5 top-4 w-4 h-4 text-[#8B7355]/40 pointer-events-none" />
          </div>

          <p className="text-[11px] text-[#8B7355]/70 text-center">
            💡 รหัสผ่านเริ่มต้นคือ <span className="font-bold text-[#7A8A5B]">9999</span>
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#FAF8F5] text-[#8B7355] hover:bg-[#E6E2D6] rounded-xl text-xs font-head font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isVerifying || pin.length !== 4}
              className="flex-1 py-2.5 bg-[#7A8A5B] hover:bg-[#4A5338] disabled:opacity-40 text-white rounded-xl text-xs font-head font-medium transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              {isVerifying ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
