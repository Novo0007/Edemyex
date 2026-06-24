
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'admin';
  profileImageUrl?: string;
}

export interface Extension {
  id: string;
  developerId: string;
  name: string;
  description: string;
  status: 'active' | 'locked' | 'maintenance';
  secretKey: string;
  createdAt: any;
}

export interface License {
  id: string;
  extensionId: string;
  key: string;
  userEmail: string;
  status: 'active' | 'revoked' | 'expired';
  expiresAt?: any;
}
