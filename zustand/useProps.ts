import { create } from 'zustand';

interface GlobalState {
  userId: string;
  setUserId: (userId: string) => void;
}

const getInitialValue = <T>(key: string, defaultValue: T): T  => {
  if (typeof window !== "undefined") {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  }
  return defaultValue;
};
const getInitValue = (key: string, defaultValue: string) => {
  if (typeof window !== "undefined") {
    const storedValue = localStorage.getItem(key);
    return storedValue ? storedValue : defaultValue;
  }
  return defaultValue;
};

const useGlobalStore = create<GlobalState>((set) => ({
  userId: getInitValue('userId', ''),
  setUserId: (userId: string) => {
    set({ userId });
    localStorage.setItem('userId', userId);
  }}));

export default useGlobalStore;
