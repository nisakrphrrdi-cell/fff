import React, { useState, useMemo } from 'react';
import type { Flower, GuildMember, RarityType } from '../types.ts';
import { RARITY_CONFIG } from '../types.ts';
import {
  Search,
  CheckCircle2,
  Circle,
  Info,
  Sparkles,
  Trophy,
  SlidersHorizontal,
  CheckCheck,
  X,
} from 'lucide-react';

interface MyFlowersTabProps {
  currentUser: GuildMember;
  flowers: Flower[];
  onToggleFlower: (flowerId: string) => Promise<void>;
  onBatchUpdate: (flowerIds: string[], action: 'add' | 'remove') => Promise<void>;
  onInspectFlower: (flower: Flower) => void;
}

export const MyFlowersTab: React.FC<MyFlowersTabProps> = ({
  currentUser,
  flowers,
  onToggleFlower,
  onBatchUpdate,
  onInspectFlower,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwnership, setFilterOwnership] = useState<'all' | 'owned' | 'unowned'>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rarityDesc' | 'rarityAsc' | 'name'>('rarityDesc');
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const ownedSet = useMemo(() => new Set(currentUser.flowers || []), [currentUser.flowers]);

  // Points calculation
  const { totalPoints, ownedCount, totalCount, progressPct, rarityBreakdown } = useMemo(() => {
    let points = 0;
    const breakdown: Record<RarityType, { owned: number; total: number }> = {
      green: { owned: 0, total: 0 },
      blue: { owned: 0, total: 0 },
      purple21: { owned: 0, total: 0 },
      purple23: { owned: 0, total: 0 },
      yellow: { owned: 0, total: 0 },
      red28: { owned: 0, total: 0 },
      red30: { owned: 0, total: 0 },
    };

    flowers.forEach((f) => {
      if (breakdown[f.rarity]) {
        breakdown[f.rarity].total += 1;
        if (ownedSet.has(f.id)) {
          breakdown[f.rarity].owned += 1;
          points += RARITY_CONFIG[f.rarity]?.points || 0;
        }
      }
    });

    const owned = ownedSet.size;
    const total = flowers.length;
    const pct = total === 0 ? 0 : Math.round((owned / total) * 100);

    return {
      totalPoints: points,
      ownedCount: owned,
      totalCount: total,
      progressPct: pct,
      rarityBreakdown: breakdown,
    };
  }, [flowers, ownedSet]);

  // Filtered flowers
  const filteredFlowers = useMemo(() => {
    let result = flowers.filter((f) => {
      const isOwned = ownedSet.has(f.id);
      if (filterOwnership === 'owned' && !isOwned) return false;
      if (filterOwnership === 'unowned' && isOwned) return false;
      if (filterRarity !== 'all' && f.rarity !== filterRarity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = (f.description || '').toLowerCase().includes(q);
        const matchesRarity = RARITY_CONFIG[f.rarity]?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesRarity) return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      const ptsA = RARITY_CONFIG[a.rarity]?.points || 0;
      const ptsB = RARITY_CONFIG[b.rarity]?.points || 0;
      if (sortBy === 'rarityDesc') {
        if (ptsB !== ptsA) return ptsB - ptsA;
        return a.name.localeCompare(b.name, 'th');
      }
      if (sortBy === 'rarityAsc') {
        if (ptsA !== ptsB) return ptsA - ptsB;
        return a.name.localeCompare(b.name, 'th');
      }
      return a.name.localeCompare(b.name, 'th');
    });

    return result;
  }, [flowers, ownedSet, filterOwnership, filterRarity, searchQuery, sortBy]);

  const handleCardClick = async (flowerId: string) => {
    try {
      setIsUpdatingId(flowerId);
      await onToggleFlower(flowerId);
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleBatchSelectAll = async () => {
    const idsToSelect = filteredFlowers.map((f) => f.id);
    if (idsToSelect.length === 0) return;
    await onBatchUpdate(idsToSelect, 'add');
  };

  const handleBatchDeselectAll = async () => {
    const idsToDeselect = filteredFlowers.map((f) => f.id);
    if (idsToDeselect.length === 0) return;
    await onBatchUpdate(idsToDeselect, 'remove');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#E6E2D6] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#7A8A5B]/15 text-[#4A5338] font-head">
                แปลงสะสมส่วนตัว
              </span>
              <span className="text-xs text-[#8B7355]">โลกสวนดอกไม้</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-head text-[#4A5338]">
              ความคืบหน้าของ <span className="text-[#7A8A5B]">{currentUser.name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#E6E2D6] self-start sm:self-auto">
            <div>
              <p className="text-[10px] text-[#8B7355] font-head uppercase tracking-wider">ดอกไม้ที่ครอบครอง</p>
              <p className="text-base sm:text-lg font-bold font-head text-[#4A5338]">
                <span className="text-[#7A8A5B] text-xl sm:text-2xl">{ownedCount}</span> / {totalCount} ดอก
              </p>
            </div>
            <div className="w-[1px] h-8 bg-[#E6E2D6]"></div>
            <div>
              <p className="text-[10px] text-[#8B7355] font-head uppercase tracking-wider">คะแนนสะสม</p>
              <p className="text-base sm:text-lg font-bold font-head text-[#DDA15E] flex items-center gap-1">
                <Trophy className="w-4 h-4 text-[#DDA15E]" />
                <span className="text-xl sm:text-2xl text-[#8A5617]">{totalPoints}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-[#8B7355]">
            <span>ความสมบูรณ์ของสมุดสะสม</span>
            <span className="font-head font-bold text-[#7A8A5B]">{progressPct}%</span>
          </div>
          <div className="w-full bg-[#E6E2D6]/60 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-[#84A98C] via-[#7A8A5B] to-[#4A5338] h-full rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        {/* Rarity Breakdown Bar */}
        <div className="mt-4 pt-3 border-t border-[#FAF8F5] flex flex-wrap gap-2 text-[11px]">
          {(Object.keys(RARITY_CONFIG) as RarityType[]).map((rKey) => {
            const conf = RARITY_CONFIG[rKey];
            const data = rarityBreakdown[rKey] || { owned: 0, total: 0 };
            return (
              <div
                key={rKey}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E6E2D6]/70 text-[#4A5338]"
              >
                <span className={`w-2 h-2 rounded-full ${conf.colorClass}`}></span>
                <span className="font-head text-[#8B7355]">{conf.name}:</span>
                <span className="font-semibold">
                  {data.owned}/{data.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อดอกไม้, สายพันธุ์, คำอธิบาย..."
            className="w-full bg-white border border-[#E6E2D6] rounded-2xl pl-11 pr-10 py-3 text-sm text-[#4A5338] placeholder-[#8B7355]/50 focus:outline-none focus:border-[#7A8A5B] focus:ring-1 focus:ring-[#7A8A5B] shadow-xs transition-all"
          />
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8B7355]/60" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-[#8B7355] hover:text-[#4A5338]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Ownership Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterOwnership('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-head font-medium transition-all ${
                filterOwnership === 'all'
                  ? 'bg-[#7A8A5B] text-white shadow-xs'
                  : 'bg-white text-[#8B7355] border border-[#E6E2D6] hover:border-[#7A8A5B]'
              }`}
            >
              ทั้งหมด ({flowers.length})
            </button>
            <button
              onClick={() => setFilterOwnership('owned')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-head font-medium transition-all ${
                filterOwnership === 'owned'
                  ? 'bg-[#7A8A5B] text-white shadow-xs'
                  : 'bg-white text-[#8B7355] border border-[#E6E2D6] hover:border-[#7A8A5B]'
              }`}
            >
              มีแล้ว ({ownedCount})
            </button>
            <button
              onClick={() => setFilterOwnership('unowned')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-head font-medium transition-all ${
                filterOwnership === 'unowned'
                  ? 'bg-[#7A8A5B] text-white shadow-xs'
                  : 'bg-white text-[#8B7355] border border-[#E6E2D6] hover:border-[#7A8A5B]'
              }`}
            >
              ยังไม่มี ({totalCount - ownedCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#8B7355] ml-auto">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-[#E6E2D6] rounded-xl px-2.5 py-1 text-xs text-[#4A5338] focus:outline-none focus:border-[#7A8A5B]"
            >
              <option value="rarityDesc">เรียง: แต้มมากไปน้อย</option>
              <option value="rarityAsc">เรียง: แต้มน้อยไปมาก</option>
              <option value="name">เรียง: ตามชื่อ ก-ฮ</option>
            </select>
          </div>
        </div>

        {/* Filter Rarity Row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
          <button
            onClick={() => setFilterRarity('all')}
            className={`px-3 py-1 rounded-full text-xs font-head whitespace-nowrap transition-all ${
              filterRarity === 'all'
                ? 'bg-[#4A5338] text-white'
                : 'bg-white text-[#8B7355] border border-[#E6E2D6] hover:border-[#4A5338]'
            }`}
          >
            ทุกระดับ
          </button>

          {(Object.keys(RARITY_CONFIG) as RarityType[]).map((rKey) => {
            const conf = RARITY_CONFIG[rKey];
            const isSelected = filterRarity === rKey;
            return (
              <button
                key={rKey}
                onClick={() => setFilterRarity(rKey)}
                className={`px-2.5 py-1 rounded-full text-xs font-head whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? `${conf.colorClass} text-white shadow-xs`
                    : 'bg-white text-[#8B7355] border border-[#E6E2D6] hover:border-[#7A8A5B]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : conf.colorClass}`}
                ></span>
                <span>
                  {conf.name} ({conf.points} แต้ม)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Helper text & Batch actions bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#E6E2D6]">
        <p className="text-xs text-[#8B7355] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#7A8A5B]" />
          <span>แตะที่การ์ดเพื่อเปิด/ปิดบันทึกว่ามีดอกไม้นี้แล้ว (บันทึกอัตโนมัติ)</span>
        </p>

        {filteredFlowers.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleBatchSelectAll}
              className="text-[#7A8A5B] hover:text-[#4A5338] font-medium font-head flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#E6E2D6] hover:border-[#7A8A5B] transition-all"
              title="ทำเครื่องหมายมีแล้วทั้งหมดในรายการที่กำลังแสดง"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>เลือกทั้งหมด ({filteredFlowers.length})</span>
            </button>
            <button
              onClick={handleBatchDeselectAll}
              className="text-[#8B7355] hover:text-[#B56576] font-medium font-head flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#E6E2D6] hover:border-[#B56576] transition-all"
              title="ยกเลิกการเลือกทั้งหมดในรายการที่กำลังแสดง"
            >
              <span>ล้างทั้งหมด</span>
            </button>
          </div>
        )}
      </div>

      {/* Flower Cards Grid */}
      {filteredFlowers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E6E2D6] p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E6E2D6] flex items-center justify-center text-3xl mb-3 text-[#8B7355]">
            🌿
          </div>
          <h3 className="font-head text-lg text-[#4A5338] font-semibold mb-1">
            ไม่พบดอกไม้ที่ตรงกับเงื่อนไข
          </h3>
          <p className="text-xs text-[#8B7355] max-w-xs">
            ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูพรรณไม้ชนิดอื่น
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterOwnership('all');
              setFilterRarity('all');
            }}
            className="mt-4 px-4 py-2 bg-[#7A8A5B] text-white text-xs font-head rounded-xl hover:bg-[#4A5338] transition-all"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredFlowers.map((flower) => {
            const isOwned = ownedSet.has(flower.id);
            const conf = RARITY_CONFIG[flower.rarity] || RARITY_CONFIG.green;
            const isPending = isUpdatingId === flower.id;

            const fallbackImg = `https://placehold.co/300x300/FAF8F5/8B7355?text=${encodeURIComponent(
              flower.name.slice(0, 4)
            )}&font=Prompt`;

            return (
              <div
                key={flower.id}
                onClick={() => handleCardClick(flower.id)}
                className={`group relative rounded-2xl p-2.5 sm:p-3 cursor-pointer select-none border transition-all duration-200 flex flex-col justify-between ${
                  isOwned
                    ? 'bg-[#F4F7F2] border-[#7A8A5B] shadow-sm ring-1 ring-[#7A8A5B]/30'
                    : 'bg-white border-[#E6E2D6] hover:border-[#84A98C] hover:shadow-xs'
                }`}
              >
                {/* Image Container */}
                <div className="relative rounded-xl overflow-hidden bg-[#FAF8F5] pb-[100%] mb-2.5 border border-[#E6E2D6]/50">
                  <img
                    src={flower.imageUrl}
                    alt={flower.name}
                    loading="lazy"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImg;
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      isOwned ? 'filter-none' : 'opacity-85 grayscale-[25%]'
                    }`}
                  />

                  {/* Rarity & Points Tag */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold font-head text-white shadow-xs flex items-center gap-1 ${conf.colorClass}`}
                      title={`${conf.name} (${conf.points} คะแนน)`}
                    >
                      <span>{conf.points}</span>
                    </span>
                  </div>

                  {/* Owned Checkmark */}
                  <div className="absolute top-2 right-2 z-10">
                    {isPending ? (
                      <div className="w-6 h-6 rounded-full bg-white/90 border border-[#7A8A5B] flex items-center justify-center animate-spin">
                        <div className="w-3 h-3 border-2 border-[#7A8A5B] border-t-transparent rounded-full"></div>
                      </div>
                    ) : isOwned ? (
                      <div className="w-6 h-6 rounded-full bg-[#7A8A5B] text-white flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4 fill-[#7A8A5B] text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/70 text-[#8B7355]/40 flex items-center justify-center backdrop-blur-xs group-hover:text-[#7A8A5B] group-hover:bg-white transition-all">
                        <Circle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Info inspect button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectFlower(flower);
                    }}
                    className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-white text-[#8B7355] hover:text-[#4A5338] flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs"
                    title="ดูข้อมูลพรรณไม้"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name & Rarity Label */}
                <div className="px-1 text-center">
                  <h4 className="text-xs sm:text-sm font-semibold font-head text-[#4A5338] truncate w-full tracking-wide">
                    {flower.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span
                      className={`text-[10px] font-medium ${conf.textColor}`}
                    >
                      {conf.name}
                    </span>
                    <span className="text-[10px] text-[#8B7355]/50">&bull;</span>
                    <span className="text-[10px] text-[#8B7355]">
                      {conf.points} คะแนน
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
