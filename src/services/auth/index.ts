// Auth service abstraction — real impl calls VITE_AUTH_API_URL and will
// support email/password, OAuth, and passkeys. For now, only anonymous/
// guest mode is implemented so the product can be demoed without an
// account system.
import type { User } from '@/types';

async function continueAsGuest(): Promise<User> {
  return {
    id: 'guest-' + Math.random().toString(36).slice(2, 10),
    name: 'Guest',
    isAnonymous: true,
  };
}

export const authService = {
  continueAsGuest,
};