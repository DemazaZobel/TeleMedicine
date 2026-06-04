import { create } from 'zustand';

// ─── State ───────────────────────────────────────────────
interface ChatState {
  isImplemented: boolean;
}

// ─── Actions ─────────────────────────────────────────────
interface ChatActions {}

type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  isImplemented: false,
};

/**
 * Skeleton store for the Chat feature.
 * Features are currently unimplemented on the backend.
 */
export const useChatStore = create<ChatStore>(() => ({
  ...initialState,
}));
