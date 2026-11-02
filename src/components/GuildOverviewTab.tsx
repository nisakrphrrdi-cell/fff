import React, { useState, useMemo } from 'react';
import type { Flower, GuildMember, RarityType } from '../types.ts';
import { RARITY_CONFIG } from '../types.ts';
import {
  Users,
  Search,
  Sparkles,
  Trophy,
  AlertTriangle,
  Flower2,
  ChevronRight,
  XCircle,
  Copy,
  Check,
  IdCard,
} from 'lucide-react';

interface GuildOverviewTabProps {
  flowers: Flower[];
  members: GuildMember[];
  currentUserId?: string;
  onInspectFlower: (flower: Flower) => void;
  onSelectMember: (member: GuildMember) => void;
}

export const GuildOverviewTab: React.FC<GuildOverviewTabProps> = ({
  flowers,
  members,
  currentUserId,
  onInspectFlower,
  onSelectMember,
}) => {
  const [viewMode, setViewMode] = useState<'byFlower' | 'byMember'>('byFlower');
  const [flowerSearch, setFlowerSearch] = useState('');
  const [flowerFilter, setFlowerFilter] = useState<'all' | 'missing' | 'single' | RarityType>('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Map flowers to their owners
  const flowerOwnershipMap = useMemo(() => {
    const map = new Map<string, GuildMember[]>();
    flowers.forEach((f) => map.set(f.id, []));

    members.forEach((m) => {
      (m.flowers || []).forEach((fid) => {
        if (map.has(fid)) {
          map.get(fid)!.push(m);
        }
      });
    });

    return map;
  }, [flowers, members]);

  // Overall Guild Stats
  const { totalMembers, totalCatalogFlowers, foundByAnyoneCount, missingAcrossGuildCount } = useMemo(() => {
    let foundCount = 0;
    flowerOwnershipMap.forEach((owners) => {
      if (owners.length > 0) foundCount++;
    });

    return {
      totalMembers: members.length,
      totalCatalogFlowers: flowers.length,
      foundByAnyoneCount: foundCount,
      missingAcrossGuildCount: flowers.length - foundCount,
    };
  }, [flowerOwnershipMap, members, flowers]);

  // Member Leaderboard calculation
  const rankedMembers = useMemo(() => {
    const list = members.map((m) => {
      let score = 0;
      const owned = m.flowers || [];
      owned.forEach((fid) => {
        const flower = flowers.find((f) => f.id === fid);
        if (flower && RARITY_CONFIG[flower.rarity]) {
          score += RARITY_CONFIG[flower.rarity].points;
        }
      });
      return {
        ...m,
        calculatedScore: score,
        ownedCount: owned.length,
      };
    });

    list.sort((a, b) => {
      if (b.calculatedScore !== a.calculatedScore) {
        return b.calculatedScore - a.calculatedScore;
      }
      return b.ownedCount - a.ownedCount;
    });

    return list;
  }, [members, flowers]);

  // Filtered Flowers for "byFlower" view
  const filteredFlowers = useMemo(() => {
    return flowers.filter((f) => {
      const owners = flowerOwnershipMap.get(f.id) || [];
      if (flowerFilter === 'missing' && owners.length > 0) return false;
      if (flowerFilter === 'single' && owners.length !== 1) return false;
      if (
        flowerFilter !== 'all' &&
        flowerFilter !== 'missing' &&
        flowerFilter !== 'single' &&
        f.rarity !== flowerFilter
      ) {
        return false;
      }

      if (flowerSearch.trim()) {
        const q = flowerSearch.toLowerCase().trim();
        const matchName = f.name.toLowerCase().includes(q);
        const matchDesc = (f.description || '').toLowerCase().includes(q);
        const matchOwner = owners.some((o) => o.name.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchOwner) return false;
      }

      return true;
    });
  }, [flowers, flowerOwnershipMap, flowerFilter, flowerSearch]);

  // Filtered Members for "byMember" view
  const filteredMembers = useMemo(() => {
    let list = [...rankedMembers];
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.gameId || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [rankedMembers, memberSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Guild Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E2D6] text-center">
          <p className="text-[11px] font-head text-[#8B7355] uppercase tracking-wider mb-1">สมาชิกในกิลด์</p>
          <h3 className="text-2xl sm:text-3xl font-bold font-head text-[#4A5338]">{totalMembers}</h3>
          <p className="text-[10px] text-[#8B7355]/80 mt-0.5">นักปลูกร่วมผจญภัย</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E2D6] text-center">
          <p className="text-[11px] font-head text-[#8B7355] uppercase tracking-wider mb-1">สมุดพรรณไม้</p>
          <h3 className="text-2xl sm:text-3xl font-bold font-head text-[#7A8A5B]">{totalCatalogFlowers}</h3>
          <p className="text-[10px] text-[#8B7355]/80 mt-0.5">ชนิดที่มีในระบบ</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E2D6] text-center">
          <p className="text-[11px] font-head text-[#8B7355] uppercase tracking-wider mb-1">กิลด์ค้นพบแล้ว</p>
          <h3 className="text-2xl sm:text-3xl font-bold font-head text-[#719FB0]">{foundByAnyoneCount}</h3>
          <p className="text-[10px] text-[#8B7355]/80 mt-0.5">
            {totalCatalogFlowers === 0 ? 0 : Math.round((foundByAnyoneCount / totalCatalogFlowers) * 100)}% ของสมุด
          </p>
        </div>

        <div
          onClick={() => {
            setViewMode('byFlower');
            setFlowerFilter('missing');
          }}
          className={`rounded-2xl p-4 shadow-xs border text-center cursor-pointer transition-all ${
            missingAcrossGuildCount > 0
              ? 'bg-[#B56576]/10 border-[#B56576]/30 hover:bg-[#B56576]/15'
              : 'bg-[#84A98C]/10 border-[#84A98C]/30'
          }`}
        >
          <p className="text-[11px] font-head text-[#B56576] font-medium uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            {missingAcrossGuildCount > 0 && <AlertTriangle className="w-3 h-3 text-[#B56576]" />}
            <span>ยังไม่มีใครพบ</span>
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold font-head text-[#B56576]">{missingAcrossGuildCount}</h3>
          <p className="text-[10px] text-[#B56576]/80 mt-0.5">คลิกเพื่อดูดอกไม้ที่ยังขาด</p>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-[#E6E2D6] shadow-xs">
        <button
          onClick={() => setViewMode('byFlower')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-head font-medium transition-all flex items-center justify-center gap-2 ${
            viewMode === 'byFlower'
              ? 'bg-[#7A8A5B] text-white shadow-xs'
              : 'text-[#8B7355] hover:text-[#4A5338]'
          }`}
        >
          <Flower2 className="w-4 h-4" />
          <span>ดูตามดอกไม้ (ใครมีบ้าง)</span>
        </button>

        <button
          onClick={() => setViewMode('byMember')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-head font-medium transition-all flex items-center justify-center gap-2 ${
            viewMode === 'byMember'
              ? 'bg-[#7A8A5B] text-white shadow-xs'
              : 'text-[#8B7355] hover:text-[#4A5338]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>รายชื่อสมาชิก & ไอดีเกม</span>
        </button>
      </div>

      {/* VIEW 1: BY FLOWER */}
      {viewMode === 'byFlower' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={flowerSearch}
                onChange={(e) => setFlowerSearch(e.target.value)}
                placeholder="ค้นหาชื่อดอกไม้ หรือพิมพ์ชื่อสมาชิกเพื่อดูว่าเขามีดอกไหน..."
                className="w-full bg-white border border-[#E6E2D6] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#4A5338] placeholder-[#8B7355]/50 focus:outline-none focus:border-[#7A8A5B] shadow-xs"
              />
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8B7355]/60" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFlowerFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-head whitespace-nowrap transition-all ${
                  flowerFilter === 'all'
                    ? 'bg-[#7A8A5B] text-white shadow-xs'
                    : 'bg-white text-[#8B7355] border border-[#E6E2D6]'
                }`}
              >
                ทั้งหมด ({flowers.length})
              </button>

              <button
                onClick={() => setFlowerFilter('missing')}
                className={`px-3 py-1.5 rounded-full text-xs font-head whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  flowerFilter === 'missing'
                    ? 'bg-[#B56576] text-white shadow-xs'
                    : 'bg-white text-[#B56576] border border-[#B56576]/40 hover:bg-[#B56576]/10'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>ที่กิลด์ยังขาด ({missingAcrossGuildCount})</span>
              </button>

              <button
                onClick={() => setFlowerFilter('single')}
                className={`px-3 py-1.5 rounded-full text-xs font-head whitespace-nowrap transition-all ${
                  flowerFilter === 'single'
                    ? 'bg-[#DDA15E] text-white shadow-xs'
                    : 'bg-white text-[#8B7355] border border-[#E6E2D6]'
                }`}
              >
                มีแค่คนเดียวในกิลด์
              </button>

              {(Object.keys(RARITY_CONFIG) as RarityType[]).map((rKey) => {
                const conf = RARITY_CONFIG[rKey];
                return (
                  <button
                    key={rKey}
                    onClick={() => setFlowerFilter(rKey)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-head whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      flowerFilter === rKey
                        ? `${conf.colorClass} text-white shadow-xs`
                        : 'bg-white text-[#8B7355] border border-[#E6E2D6]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${conf.colorClass}`}></span>
                    <span>{conf.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flowers List with Owners */}
          {filteredFlowers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#E6E2D6] text-center text-[#8B7355]">
              <p className="text-2xl mb-2">🌿</p>
              <p className="font-head text-base font-semibold text-[#4A5338]">ไม่พบข้อมูลดอกไม้ตามเงื่อนไข</p>
              <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกตัวกรองอื่น</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFlowers.map((flower) => {
                const owners = flowerOwnershipMap.get(flower.id) || [];
                const conf = RARITY_CONFIG[flower.rarity] || RARITY_CONFIG.green;
                const fallbackImg = `https://placehold.co/150x150/FAF8F5/8B7355?text=${encodeURIComponent(
                  flower.name.slice(0, 3)
                )}&font=Prompt`;

                return (
                  <div
                    key={flower.id}
                    className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-[#E6E2D6] hover:border-[#84A98C] transition-all flex flex-col sm:flex-row sm:items-center gap-3.5"
                  >
                    {/* Flower Thumb & Rarity */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        onClick={() => onInspectFlower(flower)}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E6E2D6] cursor-pointer group"
                      >
                        <img
                          src={flower.imageUrl}
                          alt={flower.name}
                          loading="lazy"
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImg;
                          }}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div
                          className={`absolute bottom-1 right-1 w-5 h-5 rounded-md ${conf.colorClass} text-white text-[10px] font-bold font-head flex items-center justify-center shadow-xs`}
                        >
                          {conf.points}
                        </div>
                      </div>

                      <div className="sm:hidden flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold ${conf.textColor}`}>
                            {conf.name} ({conf.points} แต้ม)
                          </span>
                        </div>
                        <h4
                          onClick={() => onInspectFlower(flower)}
                          className="font-head font-bold text-[#4A5338] text-sm truncate cursor-pointer hover:text-[#7A8A5B]"
                        >
                          {flower.name}
                        </h4>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            owners.length > 0
                              ? 'bg-[#7A8A5B]/15 text-[#4A5338]'
                              : 'bg-[#B56576]/15 text-[#B56576]'
                          }`}
                        >
                          {owners.length > 0 ? `มี ${owners.length} คน` : 'ยังไม่มีใครพบ'}
                        </span>
                      </div>
                    </div>

                    {/* Flower Info for Desktop */}
                    <div className="hidden sm:block flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4
                          onClick={() => onInspectFlower(flower)}
                          className="font-head font-bold text-[#4A5338] text-base truncate cursor-pointer hover:text-[#7A8A5B]"
                        >
                          {flower.name}
                        </h4>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${conf.badgeBg} ${conf.textColor} font-head`}
                        >
                          {conf.name} &bull; {conf.points} คะแนน
                        </span>
                      </div>
                      {flower.description && (
                        <p className="text-xs text-[#8B7355] line-clamp-1">{flower.description}</p>
                      )}
                    </div>

                    {/* Owners List */}
                    <div className="flex-1 sm:max-w-xs md:max-w-md w-full pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FAF8F5]">
                      <div className="flex items-center justify-between sm:justify-end gap-2 mb-1.5 sm:hidden">
                        <span className="text-[11px] font-head text-[#8B7355]">สมาชิกที่มี:</span>
                      </div>

                      {owners.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {owners.map((owner) => {
                            const isMe = owner.id === currentUserId;
                            return (
                              <button
                                key={owner.id}
                                onClick={() => onSelectMember(owner)}
                                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                                  isMe
                                    ? 'bg-[#7A8A5B] text-white border-[#7A8A5B] shadow-xs'
                                    : 'bg-[#FAF8F5] text-[#4A5338] border-[#E6E2D6] hover:border-[#7A8A5B] hover:bg-white'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                <span className="font-medium font-head truncate max-w-[110px]">
                                  {owner.name} {isMe && '(คุณ)'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-[#B56576] font-head bg-[#B56576]/10 px-3 py-1.5 rounded-xl border border-[#B56576]/20">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ยังไม่มีใครในกิลด์ค้นพบดอกไม้นี้</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MEMBER LIST & IN-GAME ID */}
      {viewMode === 'byMember' && (
        <div className="space-y-4">
          {/* Search Member by Name or In-Game ID */}
          <div className="relative">
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="ค้นหาชื่อตัวละคร หรือค้นหาด้วยไอดีเกม..."
              className="w-full bg-white border border-[#E6E2D6] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#4A5338] placeholder-[#8B7355]/50 focus:outline-none focus:border-[#7A8A5B] shadow-xs"
            />
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8B7355]/60" />
          </div>

          {/* Members List */}
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#E6E2D6] text-center text-[#8B7355]">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E6E2D6] flex items-center justify-center mx-auto mb-3 text-[#7A8A5B]">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-head font-bold text-[#4A5338] text-base mb-1">
                {members.length === 0
                  ? 'ยังไม่มีสมาชิกในระบบกิลด์'
                  : 'ไม่พบสมาชิกที่ตรงกับคำค้นหา'}
              </h4>
              <p className="text-xs">
                {members.length === 0
                  ? 'สมาชิกสามารถลงทะเบียนชื่อตัวละครและระบุไอดีเกมได้ที่หน้าแรก'
                  : 'ลองค้นหาด้วยชื่อตัวละครหรือเลขไอดีเกมอื่น'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const isCurrentUser = member.id === currentUserId;
                const pct = flowers.length === 0 ? 0 : Math.round((member.ownedCount / flowers.length) * 100);
                const memberFlowers = flowers.filter((f) => (member.flowers || []).includes(f.id));

                return (
                  <div
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:border-[#7A8A5B] shadow-xs ${
                      isCurrentUser ? 'ring-2 ring-[#7A8A5B] bg-[#F4F7F2]' : 'border-[#E6E2D6]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Member Avatar */}
                        <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D6] flex items-center justify-center text-sm font-bold font-head text-[#7A8A5B] shrink-0 shadow-xs">
                          {member.name.slice(0, 2)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-head font-bold text-[#4A5338] text-base truncate">
                              {member.name}
                            </h4>
                            {isCurrentUser && (
                              <span className="text-[10px] font-semibold bg-[#7A8A5B] text-white px-2 py-0.5 rounded-full font-head">
                                คุณ
                              </span>
                            )}
                            {member.role === 'leader' && (
                              <span className="text-[10px] font-semibold bg-[#DDA15E]/20 text-[#8A5617] px-2 py-0.5 rounded-full font-head">
                                หัวหน้ากิลด์
                              </span>
                            )}
                          </div>

                          {/* In-Game ID Badge with 1-click Copy */}
                          <div className="flex items-center gap-2 mt-1">
                            {member.gameId ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(member.gameId || '');
                                  setCopiedId(member.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="inline-flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#E6E2D6] border border-[#E6E2D6] px-2.5 py-0.5 rounded-lg text-xs font-mono text-[#4A5338] transition-colors group/copy"
                                title="คลิกเพื่อคัดลอกไอดีเกม"
                              >
                                <span className="text-[10px] text-[#8B7355] font-head font-semibold uppercase">ไอดี:</span>
                                <span className="font-bold text-[#4A5338]">{member.gameId}</span>
                                {copiedId === member.id ? (
                                  <span className="text-[10px] text-[#7A8A5B] font-head font-medium flex items-center gap-0.5">
                                    <Check className="w-3 h-3 text-[#7A8A5B]" />
                                    <span>คัดลอกแล้ว</span>
                                  </span>
                                ) : (
                                  <Copy className="w-3 h-3 text-[#8B7355] group-hover/copy:text-[#4A5338]" />
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#8B7355]/60 italic bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E6E2D6]/50">
                                ยังไม่ระบุไอดีเกม
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FAF8F5]">
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-head font-bold text-[#4A5338]">
                            {member.ownedCount} / {flowers.length} ดอก
                          </p>
                          <p className="text-[10px] text-[#8B7355]">{pct}% ของสมุด</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold font-head text-[#7A8A5B]">
                            {member.calculatedScore} คะแนน
                          </p>
                          <p className="text-[10px] text-[#8B7355]">แต้มสะสม</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#FAF8F5] rounded-full h-1.5 overflow-hidden mb-3 border border-[#E6E2D6]/50">
                      <div
                        className="bg-[#7A8A5B] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>

                    {/* Flowers preview & View details */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#FAF8F5]">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {memberFlowers.slice(0, 8).map((f) => (
                          <div
                            key={f.id}
                            className="w-6 h-6 rounded-md overflow-hidden bg-[#FAF8F5] border border-[#E6E2D6] shrink-0"
                            title={f.name}
                          >
                            <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {memberFlowers.length > 8 && (
                          <span className="text-[10px] text-[#8B7355] font-head pl-1">
                            +{memberFlowers.length - 8} ดอก
                          </span>
                        )}
                        {memberFlowers.length === 0 && (
                          <span className="text-xs text-[#8B7355]/60 italic">ยังไม่ได้บันทึกดอกไม้</span>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-[#7A8A5B] font-head font-medium hover:underline shrink-0">
                        <span>ดูพรรณไม้</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
