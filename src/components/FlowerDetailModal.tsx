import React from 'react';
import type { Flower, GuildMember } from '../types.ts';
import { RARITY_CONFIG } from '../types.ts';
import { X, CheckCircle2, Circle, Users, Sparkles } from 'lucide-react';

interface FlowerDetailModalProps {
  flower: Flower | null;
  onClose: () => void;
  members: GuildMember[];
  currentUserId?: string;
  onToggleMyFlower?: (flowerId: string) => Promise<void>;
}

export const FlowerDetailModal: React.FC<FlowerDetailModalProps> = ({
  flower,
  onClose,
  members,
  currentUserId,
  onToggleMyFlower,
}) => {
  if (!flower) return null;

  const conf = RARITY_CONFIG[flower.rarity] || RARITY_CONFIG.green;
  const owners = members.filter((m) => (m.flowers || []).includes(flower.id));
  const isOwnedByMe = currentUserId ? (members.find((m) => m.id === currentUserId)?.flowers || []).includes(flower.id) : false;

  const fallbackImg = `https://placehold.co/400x400/FAF8F5/8B7355?text=${encodeURIComponent(
    flower.name.slice(0, 4)
  )}&font=Prompt`;

  return (
    <div className="fixed inset-0 z-50 bg-[#4A5338]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E6E2D6] overflow-hidden relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#8B7355] hover:text-[#4A5338] flex items-center justify-center backdrop-blur-xs shadow-xs transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Flower Image */}
        <div className="relative w-full h-60 sm:h-64 bg-[#FAF8F5]">
          <img
            src={flower.imageUrl}
            alt={flower.name}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = fallbackImg;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Rarity & Points Floating Badge */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-head text-white shadow-xs flex items-center gap-1.5 ${conf.colorClass}`}
            >
              <span>{conf.name}</span>
              <span>&bull;</span>
              <span>{conf.points} คะแนน</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-head font-bold text-xl text-[#4A5338] mb-1">
              {flower.name}
            </h3>
            {flower.description ? (
              <p className="text-xs sm:text-sm text-[#8B7355] leading-relaxed">
                {flower.description}
              </p>
            ) : (
              <p className="text-xs text-[#8B7355]/70 italic">
                พรรณไม้งดงามในโลกสวนดอกไม้
              </p>
            )}
          </div>

          {/* Toggle for Current User */}
          {currentUserId && onToggleMyFlower && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isOwnedByMe ? (
                  <CheckCircle2 className="w-5 h-5 text-[#7A8A5B]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#8B7355]/50" />
                )}
                <div>
                  <p className="text-xs font-head font-bold text-[#4A5338]">สถานะของคุณ</p>
                  <p className="text-[11px] text-[#8B7355]">
                    {isOwnedByMe ? 'คุณครอบครองดอกไม้นี้แล้ว' : 'คุณยังไม่มีดอกไม้นี้'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggleMyFlower(flower.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-head font-medium transition-all ${
                  isOwnedByMe
                    ? 'bg-white text-[#B56576] border border-[#B56576]/30 hover:bg-[#B56576]/10'
                    : 'bg-[#7A8A5B] text-white hover:bg-[#4A5338]'
                }`}
              >
                {isOwnedByMe ? 'ยกเลิกการมี' : 'บันทึกว่ามีแล้ว'}
              </button>
            </div>
          )}

          {/* Guild Owners Section */}
          <div className="pt-2 border-t border-[#FAF8F5]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-head font-bold text-xs text-[#4A5338] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#7A8A5B]" />
                <span>สมาชิกกิลด์ที่ค้นพบแล้ว ({owners.length} คน)</span>
              </h4>
            </div>

            {owners.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {owners.map((o) => (
                  <div
                    key={o.id}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E6E2D6] text-xs font-head text-[#4A5338] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A8A5B]"></span>
                    <span>{o.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-[#B56576]/10 rounded-2xl border border-[#B56576]/20 text-[#B56576] text-xs font-head">
                🌱 ยังไม่มีสมาชิกคนใดในกิลด์ค้นพบดอกไม้นี้
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
