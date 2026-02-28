export interface Author {
  id: string;
  name: string;
  email: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  summary?: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  _count: {
    comments: number;
    likes: number;
  };
}

export interface BlogDetail extends Blog {
  comments: Comment[];
  hasLiked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
}

export interface FeedResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  token: string;
}

export interface LikeResponse {
  liked: boolean;
  count: number;
}
