export type RarityType =
  | 'green'
  | 'blue'
  | 'purple21'
  | 'purple23'
  | 'yellow'
  | 'red28'
  | 'red30';

export interface Flower {
  id: string;
  name: string;
  rarity: RarityType;
  imageUrl: string;
  description?: string;
  createdAt?: number;
}

export interface GuildMember {
  id: string;
  name: string;
  gameId?: string; // ไอดีเกม (Game ID / Character ID)
  pin: string; // 4 digits
  flowers: string[]; // array of flower IDs
  role?: 'member' | 'officer' | 'leader';
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

export interface GuildDataResponse {
  flowers: Flower[];
  members: GuildMember[];
  adminPinConfigured: boolean;
  guildName: string;
}

export const RARITY_CONFIG: Record<
  RarityType,
  {
    name: string;
    points: number;
    colorClass: string;
    badgeBg: string;
    badgeBorder: string;
    textColor: string;
    dotColor: string;
  }
> = {
  green: {
    name: 'ธรรมดา',
    points: 9,
    colorClass: 'bg-[#84A98C]',
    badgeBg: 'bg-[#84A98C]/15',
    badgeBorder: 'border-[#84A98C]',
    textColor: 'text-[#476B4F]',
    dotColor: '#84A98C',
  },
  blue: {
    name: 'ทั่วไป',
    points: 14,
    colorClass: 'bg-[#719FB0]',
    badgeBg: 'bg-[#719FB0]/15',
    badgeBorder: 'border-[#719FB0]',
    textColor: 'text-[#366477]',
    dotColor: '#719FB0',
  },
  purple21: {
    name: 'หายาก',
    points: 21,
    colorClass: 'bg-[#9C89B8]',
    badgeBg: 'bg-[#9C89B8]/15',
    badgeBorder: 'border-[#9C89B8]',
    textColor: 'text-[#624D7F]',
    dotColor: '#9C89B8',
  },
  purple23: {
    name: 'หายากพิเศษ',
    points: 23,
    colorClass: 'bg-[#8B6CA8]',
    badgeBg: 'bg-[#8B6CA8]/15',
    badgeBorder: 'border-[#8B6CA8]',
    textColor: 'text-[#50326D]',
    dotColor: '#8B6CA8',
  },
  yellow: {
    name: 'งดงาม',
    points: 25,
    colorClass: 'bg-[#DDA15E]',
    badgeBg: 'bg-[#DDA15E]/15',
    badgeBorder: 'border-[#DDA15E]',
    textColor: 'text-[#8A5617]',
    dotColor: '#DDA15E',
  },
  red28: {
    name: 'เซียน',
    points: 28,
    colorClass: 'bg-[#B56576]',
    badgeBg: 'bg-[#B56576]/15',
    badgeBorder: 'border-[#B56576]',
    textColor: 'text-[#7A2E3E]',
    dotColor: '#B56576',
  },
  red30: {
    name: 'เซียนสูงสุด',
    points: 30,
    colorClass: 'bg-[#9E2A2B]',
    badgeBg: 'bg-[#9E2A2B]/15',
    badgeBorder: 'border-[#9E2A2B]',
    textColor: 'text-[#9E2A2B]',
    dotColor: '#9E2A2B',
  },
};
