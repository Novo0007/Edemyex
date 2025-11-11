
export interface Course {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorId: string;
  creatorAvatar: string;
  price: number;
  imageUrl: string;
  category: string;
  videoUrl: string;
  videos: {
    title: string;
    url: string;
    duration: number; // in seconds
  }[];
  outline: string;
  status: 'pending' | 'published' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string;
  purchasedCourseIds: string[];
  favoriteCreatorIds: string[];
  role: 'user' | 'creator' | 'admin';
  creatorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  payoutDetails?: {
    name: string;
    email: string;
    phone: string;
    upiId?: string;
    bank?: {
      accountNumber: string;
      ifsc: string;
    };
  };
}

export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  creatorId: string;
  purchaseDate: object; // Stored as Firestore Timestamp
  price: number;
}
