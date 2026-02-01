
export interface VsOption {
  name: string;
  imageUrl: string;
  votes: number;
  backgroundColor?: string;
  imageTransform?: {
    scale: number;
    translateX: number;
    translateY: number;
    objectFit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  };
}

export type Comment = {
  id: string;
  author: {
      name: string;
      profileImageUrl: string;
  };
  text: string;
  likes: Set<string>; // Set of user IDs who liked the comment
  replies: Comment[];
  parentId?: string | null;
};

export interface User {
    id: string;
    name: string;
    email: string;
    profileImageUrl: string;
    bio: string;
    avatarInitial: string;
    savedPostIds: Set<string>;
    following: Set<string>;
    followers: Set<string>;
}

export interface VsPost {
  id: string;
  type: 'classic' | 'match-up';
  title: string;
  topic: string;
  author: {
      id: string;
      name: string;
      profileImageUrl: string;
  };
  comments: Comment[];
  userVote: 'A' | 'B' | null;
  likes: number;
  shares: number;
  aspectRatio?: '1/1.2' | '1/1.5';

  // For Classic mode, or the current round in Match-up
  optionA?: VsOption;
  optionB?: VsOption;

  // For Match-up mode
  challengers?: { name: string; imageUrl: string; }[];
  initialChallengers?: { name:string; imageUrl: string; }[];
  eliminated?: string[];
  champion?: VsOption;
  roundResults?: { contenderA: VsOption, contenderB: VsOption }[];
  userPicks?: string[];
  currentRoundVoted?: boolean;
  userChampionSide?: 'A' | 'B' | null;
}

export enum View {
  FEED,
  CREATE,
  PROFILE,
  VOTING,
  SETTINGS,
  SAVED,
  SEARCH,
}
