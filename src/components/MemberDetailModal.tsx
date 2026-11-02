import React, { useState } from 'react';
import type { Flower, GuildMember, RarityType } from '../types.ts';
import { RARITY_CONFIG } from '../types.ts';
import { X, Trophy, CheckCircle, Circle, Copy, Check } from 'lucide-react';

interface MemberDetailModalProps {
  member: GuildMember | null;
  flowers: Flower[];
  onClose: () => void;
  onInspectFlower: (flower: Flower) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  flowers,
  onClose,
  onInspectFlower,
}) => {
  if (!member) return null;

  const [tab, setTab] = useState<'owned' | 'missing'>('owned');
  const [copied, setCopied] = useState(false);
  const ownedSet = new Set(member.flowers || []);

  const ownedFlowers = flowers.filter((f) => ownedSet.has(f.id));
  const missingFlowers = flowers.filter((f) => !ownedSet.has(f.id));

  let totalScore = 0;
  ownedFlowers.forEach((f) => {
    totalScore += RARITY_CONFIG[f.rarity]?.points || 0;
  });

  const pct = flowers.length === 0 ? 0 : Math.round((ownedFlowers.length / flowers.length) * 100);
  const displayList = tab === 'owned' ? ownedFlowers : missingFlowers;

  return (
    <div className="fixed inset-0 z-50 bg-[#4A5338]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E6E2D6] max-h-[90vh] flex flex-col overflow-hidden relative animate-scaleUp">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E2D6] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E2D6] flex items-center justify-center text-sm font-head font-bold text-[#7A8A5B] shadow-xs">
              {member.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-head font-bold text-lg text-[#4A5338]">{member.name}</h3>
                {member.role === 'leader' && (
                  <span className="text-[10px] bg-[#DDA15E]/20 text-[#8A5617] px-2 py-0.5 rounded-full font-head font-semibold">
                    หัวหน้ากิลด์
                  </span>
                )}
              </div>

              {/* Game ID Badge */}
              <div className="flex items-center gap-2 mt-0.5">
                {member.gameId ? (
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(member.gameId || '');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#E6E2D6] px-2 py-0.5 rounded-md text-xs font-mono text-[#4A5338] cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                    title="คลิกเพื่อคัดลอกไอดีเกม"
                  >
                    <span className="text-[10px] text-[#8B7355] font-head font-semibold uppercase">ไอดี:</span>
                    <span className="font-bold">{member.gameId}</span>
                    {copied ? (
                      <span className="text-[10px] text-[#7A8A5B] font-head flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-[#7A8A5B]" />
                        <span>คัดลอกแล้ว</span>
                      </span>
                    ) : (
                      <Copy className="w-3 h-3 text-[#8B7355]" />
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-[#8B7355]/60 italic">ยังไม่ระบุไอดีเกม</span>
                )}
              </div>

              <p className="text-xs text-[#8B7355] flex items-center gap-2 mt-1">
                <span>สะสม {ownedFlowers.length} / {flowers.length} ดอก ({pct}%)</span>
                <span>&bull;</span>
                <span className="text-[#8A5617] font-bold flex items-center gap-0.5">
                  <Trophy className="w-3.5 h-3.5 text-[#DDA15E]" />
                  <span>{totalScore} คะแนน</span>
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#8B7355] hover:text-[#4A5338] border border-[#E6E2D6] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E6E2D6] px-6 bg-white shrink-0">
          <button
            onClick={() => setTab('owned')}
            className={`py-3 px-4 font-head text-xs sm:text-sm font-semibold border-b-2 -mb-[1px] transition-all flex items-center gap-1.5 ${
              tab === 'owned'
                ? 'border-[#7A8A5B] text-[#7A8A5B]'
                : 'border-transparent text-[#8B7355] hover:text-[#4A5338]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>มีแล้ว ({ownedFlowers.length})</span>
          </button>
          <button
            onClick={() => setTab('missing')}
            className={`py-3 px-4 font-head text-xs sm:text-sm font-semibold border-b-2 -mb-[1px] transition-all flex items-center gap-1.5 ${
              tab === 'missing'
                ? 'border-[#B56576] text-[#B56576]'
                : 'border-transparent text-[#8B7355] hover:text-[#4A5338]'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span>ยังไม่มี ({missingFlowers.length})</span>
          </button>
        </div>

        {/* Scrollable list */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-2">
          {displayList.length === 0 ? (
            <div className="text-center py-12 text-[#8B7355] text-xs">
              {tab === 'owned' ? 'ยังไม่ได้บันทึกดอกไม้ใดๆ' : 'ยอดเยี่ยมมาก! สมาชิกคนนี้สะสมครบทุกดอกแล้ว'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {displayList.map((f) => {
                const conf = RARITY_CONFIG[f.rarity] || RARITY_CONFIG.green;
                return (
                  <div
                    key={f.id}
                    onClick={() => onInspectFlower(f)}
                    className="p-2 rounded-xl border border-[#E6E2D6] bg-[#FAF8F5] hover:border-[#7A8A5B] cursor-pointer transition-all flex items-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-[#E6E2D6] shrink-0">
                      <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-head text-xs font-semibold text-[#4A5338] truncate">{f.name}</p>
                      <span className={`text-[10px] font-medium ${conf.textColor}`}>
                        {conf.name} ({conf.points})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
