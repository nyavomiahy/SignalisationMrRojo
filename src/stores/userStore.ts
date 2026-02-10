// src/stores/userStore.ts
import { ref } from 'vue';
import type { AppUser } from '@/services/userService';
import { getCurrentUserFromStorage } from '@/services/userService';

export const currentUser = ref<AppUser | null>(getCurrentUserFromStorage());

export function setCurrentUser(user: AppUser | null) {
  currentUser.value = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}
