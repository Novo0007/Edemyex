
import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'admin';
  profileImageUrl?: string;
  createdAt?: string;
}

export interface Extension {
  id: string;
  developerId: string;
  name: string;
  description: string;
  status: 'active' | 'locked' | 'maintenance';
  secretKey: string;
  createdAt: Timestamp;
}

export interface License {
  id: string;
  extensionId: string;
  key: string;
  userEmail: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}
