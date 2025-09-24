/**
 * Access Control System for Trusted Test Users
 * This system restricts app access to only approved users
 */

export interface TrustedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'tester' | 'beta';
  accessLevel: number; // 1 = basic, 2 = advanced, 3 = full
  addedAt: string;
  addedBy: string;
  isActive: boolean;
}

// Trusted users list - Add your test users here
export const TRUSTED_USERS: TrustedUser[] = [
  {
    id: 'trusted-user-1',
    email: 'your-email@example.com', // Replace with your email
    name: 'Your Name',
    role: 'admin',
    accessLevel: 3,
    addedAt: new Date().toISOString(),
    addedBy: 'system',
    isActive: true
  },
  {
    id: 'trusted-user-2',
    email: 'test-user-1@example.com', // Add your first test user
    name: 'Test User 1',
    role: 'tester',
    accessLevel: 2,
    addedAt: new Date().toISOString(),
    addedBy: 'admin',
    isActive: true
  },
  {
    id: 'trusted-user-3',
    email: 'test-user-2@example.com', // Add your second test user
    name: 'Test User 2',
    role: 'beta',
    accessLevel: 1,
    addedAt: new Date().toISOString(),
    addedBy: 'admin',
    isActive: true
  }
];

export class AccessControl {
  /**
   * Check if a user email is in the trusted users list
   */
  static isTrustedUser(email: string): boolean {
    return TRUSTED_USERS.some(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.isActive
    );
  }

  /**
   * Get user access level
   */
  static getUserAccessLevel(email: string): number {
    const user = TRUSTED_USERS.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.isActive
    );
    return user?.accessLevel || 0;
  }

  /**
   * Get user role
   */
  static getUserRole(email: string): string {
    const user = TRUSTED_USERS.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.isActive
    );
    return user?.role || 'none';
  }

  /**
   * Check if user has specific access level
   */
  static hasAccessLevel(email: string, requiredLevel: number): boolean {
    return this.getUserAccessLevel(email) >= requiredLevel;
  }

  /**
   * Check if user has specific role
   */
  static hasRole(email: string, requiredRole: string): boolean {
    return this.getUserRole(email) === requiredRole;
  }

  /**
   * Add a new trusted user
   */
  static addTrustedUser(
    email: string, 
    name: string, 
    role: 'admin' | 'tester' | 'beta' = 'beta',
    accessLevel: number = 1,
    addedBy: string = 'admin'
  ): boolean {
    // Check if user already exists
    if (this.isTrustedUser(email)) {
      return false;
    }

    const newUser: TrustedUser = {
      id: `trusted-user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role,
      accessLevel,
      addedAt: new Date().toISOString(),
      addedBy,
      isActive: true
    };

    TRUSTED_USERS.push(newUser);
    return true;
  }

  /**
   * Remove a trusted user
   */
  static removeTrustedUser(email: string): boolean {
    const userIndex = TRUSTED_USERS.findIndex(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );

    if (userIndex === -1) {
      return false;
    }

    TRUSTED_USERS[userIndex].isActive = false;
    return true;
  }

  /**
   * Get all active trusted users
   */
  static getActiveUsers(): TrustedUser[] {
    return TRUSTED_USERS.filter(user => user.isActive);
  }

  /**
   * Get user info
   */
  static getUserInfo(email: string): TrustedUser | null {
    return TRUSTED_USERS.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.isActive
    ) || null;
  }
}

// Access level constants
export const ACCESS_LEVELS = {
  NONE: 0,
  BASIC: 1,    // Can use basic features
  ADVANCED: 2, // Can use advanced features
  FULL: 3      // Can use all features
} as const;

// Role constants
export const ROLES = {
  NONE: 'none',
  BETA: 'beta',
  TESTER: 'tester',
  ADMIN: 'admin'
} as const;
