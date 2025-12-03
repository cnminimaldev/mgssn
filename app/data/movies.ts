// data/movies.ts

export type MovieType = 'movie' | 'series'

export interface Episode {
  id: number
  title: string
  description: string
  seasonNumber: number
  episodeNumber: number
  thumbnail: string
  videoUrl: string
  runtimeMinutes?: number
}

export interface Movie {
  id: number
  title: string
  year: number
  country: string
  description: string
  thumbnail: string
  videoUrl: string
  genre: string
  type: 'movie' | 'series'
  slug: string
  previousSlugs?: string[]
  episodes?: Episode[]

  originalTitle?: string | null
  titleKana?: string | null
  releaseDate?: string | null
  director?: string | null
  mainCast?: string | null

  // 👇 mới
  genres?: {
    id: number
    slug: string
    name: string | null
    nameJa: string | null
  }[]
}

export const movies: Movie[] = [
  {
    id: 1,
    title: 'The Great Adventure',
    year: 2023,
    country: '日本',
    description:
      'A group of friends embarks on a journey that will change their lives forever.',
    thumbnail: '/images/movie1.jpg',
    videoUrl: '/videos/movie1.mp4',
    genre: 'アクション',
    type: 'movie',
    slug: 'the-great-adventure',
  },
  {
    id: 2,
    title: 'Midnight City',
    year: 2022,
    country: 'アメリカ',
    description:
      'In a sleepless city, a detective follows a trail of secrets and lies.',
    thumbnail: '/images/movie2.jpg',
    videoUrl: '/videos/movie2.mp4',
    genre: 'サスペンス',
    type: 'movie',
    slug: 'midnight-city',
  },
  {
    id: 3,
    title: 'Ocean of Stars',
    year: 2021,
    country: 'イギリス',
    description:
      'A sci-fi drama about humanity’s first voyage beyond the solar system.',
    thumbnail: '/images/movie3.jpg',
    videoUrl: '/videos/movie3.mp4',
    genre: 'SF',
    type: 'movie',
    slug: 'ocean-of-stars',
  },
  {
    id: 4,
    title: 'Hidden Truth',
    year: 2020,
    country: '日本',
    description:
      'A journalist uncovers a conspiracy that threatens everything she loves.',
    thumbnail: '/images/movie4.jpg',
    videoUrl: '/videos/movie4.mp4',
    genre: 'ミステリー',
    type: 'movie',
    slug: 'hidden-truth',
  },
  {
    id: 5,
    title: 'Last Summer',
    year: 2019,
    country: '日本',
    description: 'A nostalgic coming-of-age story about love and friendship.',
    thumbnail: '/images/movie5.jpg',
    videoUrl: '/videos/movie5.mp4',
    genre: 'ドラマ',
    type: 'movie',
    slug: 'last-summer',
  },
  {
    id: 6,
    title: 'Neon Runner',
    year: 2024,
    country: '韓国',
    description:
      'In a neon-drenched future, a courier gets caught in a deadly chase.',
    thumbnail: '/images/movie6.jpg',
    videoUrl: '/videos/movie6.mp4',
    genre: 'サイバーパンク',
    type: 'movie',
    slug: 'neon-runner',
  },

  // === DEMO SERIES ===
  {
    id: 7,
    title: 'Tokyo Nights',
    year: 2024,
    country: '日本',
    description:
      'A drama series following the intertwined lives of people in Tokyo at night.',
    thumbnail: '/images/series1-main.jpg',
    // videoUrl mặc định: fallback, chủ yếu dùng cho trường hợp type=movie
    videoUrl: '/videos/series1-ep1.mp4',
    genre: 'ドラマ',
    type: 'series',
    slug: 'tokyo-nights',
    // ví dụ slug cũ để test redirect 301: /series/tokyo-no-yoru/episode/1
    previousSlugs: ['tokyo-no-yoru'],
    episodes: [
      {
        id: 701,
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Episode 1: Midnight Crossroads',
        description: 'A mysterious encounter connects strangers in Shibuya.',
        thumbnail: '/images/series1-ep1.jpg',
        videoUrl: '/videos/series1-ep1.mp4',
        runtimeMinutes: 24,
      },
      {
        id: 702,
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'Episode 2: Neon Echoes',
        description: 'Secrets begin to surface as the night deepens.',
        thumbnail: '/images/series1-ep2.jpg',
        videoUrl: '/videos/series1-ep2.mp4',
        runtimeMinutes: 24,
      },
      {
        id: 703,
        seasonNumber: 1,
        episodeNumber: 3,
        title: 'Episode 3: Lost Signals',
        description: 'Relationships are tested under the city lights.',
        thumbnail: '/images/series1-ep3.jpg',
        videoUrl: '/videos/series1-ep3.mp4',
        runtimeMinutes: 24,
      },
    ],
  },
]
