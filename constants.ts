
import type { VsPost, User } from './types';

export const MOCK_USERS: User[] = [
    {
        id: 'user-123',
        name: 'Jannet',
        email: 'jannet_k@yahoo.com',
        profileImageUrl: 'https://i.pravatar.cc/150?u=jannet',
        bio: 'Lover of all things tech and travel. Here to settle the great debates.',
        avatarInitial: 'J',
        savedPostIds: new Set(['3']),
        following: new Set(['user-admin', 'user-456']),
        followers: new Set(['user-admin']),
    },
    { id: 'user-admin', name: 'Admin', email: 'admin@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=admin', bio: 'The one who started it all.', avatarInitial: 'A', savedPostIds: new Set(), following: new Set(['user-123']), followers: new Set(['user-123']), },
    { id: 'user-456', name: 'Traveler', email: 'travel@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=traveler', bio: 'Wandering the globe.', avatarInitial: 'T', savedPostIds: new Set(), following: new Set(), followers: new Set(['user-123']), },
    { id: 'user-789', name: 'TechGuru', email: 'guru@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=techguru', bio: 'All things bits and bytes.', avatarInitial: 'T', savedPostIds: new Set(), following: new Set(), followers: new Set(), },
    { id: 'user-story', name: 'Storyteller', email: 'story@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=storyteller', bio: 'Weaving tales.', avatarInitial: 'S', savedPostIds: new Set(), following: new Set(), followers: new Set(), },
    { id: 'user-foodie', name: 'Foodie', email: 'foodie@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=foodie', bio: 'Epicurean adventures.', avatarInitial: 'F', savedPostIds: new Set(), following: new Set(), followers: new Set(), },
    { id: 'user-lifehacker', name: 'LifeHacker', email: 'lifehacker@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=lifehacker', bio: 'Optimizing life.', avatarInitial: 'L', savedPostIds: new Set(), following: new Set(), followers: new Set(), },
    { id: 'user-gamerx', name: 'GamerX', email: 'gamerx@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=gamerx', bio: 'Next level.', avatarInitial: 'G', savedPostIds: new Set(), following: new Set(), followers: new Set(), },
    { id: 'user-cars', name: 'CarEnthusiast', email: 'cars@example.com', profileImageUrl: 'https://i.pravatar.cc/150?u=cars', bio: 'Horsepower is my passion.', avatarInitial: 'C', savedPostIds: new Set(), following: new Set(), followers: new Set(), },
];


export const MOCK_USER: User = MOCK_USERS.find(u => u.id === 'user-123')!;

export const INITIAL_POSTS: VsPost[] = [
  {
    id: '10',
    type: 'match-up',
    title: 'Greatest Sci-Fi Movie Franchise',
    topic: 'Movies',
    author: { id: 'user-admin', name: 'Admin', profileImageUrl: 'https://i.pravatar.cc/150?u=admin' },
    comments: [],
    userVote: null,
    likes: 550,
    shares: 90,
    challengers: ['Blade Runner', 'Alien', 'The Matrix', 'Terminator', 'Dune', 'Back to the Future'].map(name => ({ name, imageUrl: `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800` })),
    initialChallengers: ['Star Wars', 'Star Trek', 'Blade Runner', 'Alien', 'The Matrix', 'Terminator', 'Dune', 'Back to the Future'].map(name => ({ name, imageUrl: `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800` })),
    eliminated: [],
    roundResults: [],
    userPicks: [],
    currentRoundVoted: false,
    userChampionSide: null,
    optionA: {
        name: 'Star Wars',
        imageUrl: 'https://picsum.photos/seed/starwars/600/800',
        votes: 0
    },
    optionB: {
        name: 'Star Trek',
        imageUrl: 'https://picsum.photos/seed/startrek/600/800',
        votes: 0
    }
  },
  {
    id: '1',
    type: 'classic',
    title: 'Dawn of Titans: Coffee vs. Tea',
    topic: 'Morning Beverages',
    author: { id: 'user-admin', name: 'Admin', profileImageUrl: 'https://i.pravatar.cc/150?u=admin' },
    optionA: {
      name: 'Coffee',
      imageUrl: 'https://picsum.photos/seed/coffee/600/800',
      votes: 134,
    },
    optionB: {
      name: 'Tea',
      imageUrl: 'https://picsum.photos/seed/tea/600/800',
      votes: 89,
    },
    userVote: null,
    likes: 45,
    shares: 12,
    comments: [
        { id: 'c1-1', author: { name: 'CodeWizard', profileImageUrl: 'https://i.pravatar.cc/150?u=wizard' }, text: 'Coffee gives me the power to code!', likes: new Set(['user-456', 'user-789']), replies: [
          { id: 'c1-1-r1', parentId: 'c1-1', author: { name: 'Jannet', profileImageUrl: 'https://i.pravatar.cc/150?u=jannet'}, text: 'True that! ☕️', likes: new Set(['user-admin']), replies: [] },
          { id: 'c1-1-r2', parentId: 'c1-1', author: { name: 'TechGuru', profileImageUrl: 'https://i.pravatar.cc/150?u=techguru'}, text: 'Same!', likes: new Set(), replies: [] }
        ]},
        { id: 'c1-2', author: { name: 'TeaLover', profileImageUrl: 'https://i.pravatar.cc/150?u=tea' }, text: 'A calm cup of Earl Grey is unbeatable.', likes: new Set(['user-123']), replies: [] },
    ],
  },
  {
    id: '2',
    type: 'classic',
    title: 'The Ultimate Showdown: Cats vs. Dogs',
    topic: 'Household Pets',
    author: { id: 'user-123', name: 'Jannet', profileImageUrl: 'https://i.pravatar.cc/150?u=jannet' },
    optionA: {
      name: 'Cats',
      imageUrl: 'https://picsum.photos/seed/cats/600/800',
      votes: 2048,
    },
    optionB: {
      name: 'Dogs',
      imageUrl: 'https://picsum.photos/seed/dogs/600/800',
      votes: 2512,
    },
    userVote: 'B',
    likes: 1023,
    shares: 256,
    comments: [
        { id: 'c2-1', author: { name: 'CatPerson', profileImageUrl: 'https://i.pravatar.cc/150?u=catperson' }, text: 'Cats are supreme.', likes: new Set(), replies: [] },
    ],
  },
    {
    id: '3',
    type: 'classic',
    title: 'Clash of Comforts: Mountains vs. Beach',
    topic: 'Vacation Spots',
    author: { id: 'user-456', name: 'Traveler', profileImageUrl: 'https://i.pravatar.cc/150?u=traveler' },
    optionA: {
      name: 'Mountains',
      imageUrl: 'https://picsum.photos/seed/mountains/600/800',
      votes: 780,
    },
    optionB: {
      name: 'Beach',
      imageUrl: 'https://picsum.photos/seed/beach/600/800',
      votes: 920,
    },
    userVote: null,
    likes: 340,
    shares: 88,
    comments: [
        { id: 'c3-1', author: { name: 'HikerGal', profileImageUrl: 'https://i.pravatar.cc/150?u=hiker' }, text: 'The fresh mountain air is everything.', likes: new Set(['user-123']), replies: [] }
    ],
  },
  {
    id: '4',
    type: 'classic',
    title: 'Digital Kingdoms: iOS vs. Android',
    topic: 'Mobile Operating Systems',
    author: { id: 'user-789', name: 'TechGuru', profileImageUrl: 'https://i.pravatar.cc/150?u=techguru' },
    optionA: {
      name: 'iOS',
      imageUrl: 'https://picsum.photos/seed/ios/600/800',
      votes: 1800,
    },
    optionB: {
      name: 'Android',
      imageUrl: 'https://picsum.photos/seed/android/600/800',
      votes: 1650,
    },
    userVote: null,
    likes: 890,
    shares: 150,
    comments: [],
  },
  {
    id: '5',
    type: 'classic',
    title: 'Reading Realm: Books vs. Movies',
    topic: 'Storytelling Mediums',
    author: { id: 'user-story', name: 'Storyteller', profileImageUrl: 'https://i.pravatar.cc/150?u=storyteller' },
    optionA: {
      name: 'Books',
      imageUrl: 'https://picsum.photos/seed/books/600/800',
      votes: 3200,
    },
    optionB: {
      name: 'Movies',
      imageUrl: 'https://picsum.photos/seed/movies/600/800',
      votes: 2900,
    },
    userVote: 'A',
    likes: 1500,
    shares: 320,
    comments: [],
  },
  {
    id: '6',
    type: 'classic',
    title: 'Sweet & Savory: Pizza vs. Ice Cream',
    topic: 'Favorite Foods',
    author: { id: 'user-foodie', name: 'Foodie', profileImageUrl: 'https://i.pravatar.cc/150?u=foodie' },
    optionA: {
      name: 'Pizza',
      imageUrl: 'https://picsum.photos/seed/pizza/600/800',
      votes: 5400,
    },
    optionB: {
      name: 'Ice Cream',
      imageUrl: 'https://picsum.photos/seed/icecream/600/800',
      votes: 4800,
    },
    userVote: null,
    likes: 2200,
    shares: 450,
    comments: [],
  },
   {
    id: '7',
    type: 'classic',
    title: 'Morning Routines: Early Bird vs. Night Owl',
    topic: 'Productivity',
    author: { id: 'user-lifehacker', name: 'LifeHacker', profileImageUrl: 'https://i.pravatar.cc/150?u=lifehacker' },
    optionA: {
      name: 'Early Bird',
      imageUrl: 'https://picsum.photos/seed/sunrise/600/800',
      votes: 950,
    },
    optionB: {
      name: 'Night Owl',
      imageUrl: 'https://picsum.photos/seed/moon/600/800',
      votes: 1100,
    },
    userVote: null,
    likes: 500,
    shares: 75,
    comments: [],
  },
  {
    id: '8',
    type: 'classic',
    title: 'Gaming Giants: PlayStation vs. Xbox',
    topic: 'Video Game Consoles',
    author: { id: 'user-gamerx', name: 'GamerX', profileImageUrl: 'https://i.pravatar.cc/150?u=gamerx' },
    optionA: {
      name: 'PlayStation',
      imageUrl: 'https://picsum.photos/seed/playstation/600/800',
      votes: 7300,
    },
    optionB: {
      name: 'Xbox',
      imageUrl: 'https://picsum.photos/seed/xbox/600/800',
      votes: 6900,
    },
    userVote: null,
    likes: 3100,
    shares: 800,
    comments: [],
  },
  {
    id: '9',
    type: 'classic',
    title: 'Automotive Age: Electric Cars vs. Gas Cars',
    topic: 'Transportation',
    author: { id: 'user-cars', name: 'CarEnthusiast', profileImageUrl: 'https://i.pravatar.cc/150?u=cars' },
    optionA: {
      name: 'Electric Cars',
      imageUrl: 'https://picsum.photos/seed/electriccar/600/800',
      votes: 2200,
    },
    optionB: {
      name: 'Gas Cars',
      imageUrl: 'https://picsum.photos/seed/gascar/600/800',
      votes: 1950,
    },
    userVote: 'A',
    likes: 950,
    shares: 210,
    comments: [],
  },
];
