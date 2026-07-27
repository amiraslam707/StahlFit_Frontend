import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadChatHistory } from './chatStorage';

function createEmptyConversation() {
  const id = Date.now().toString();
  const now = Date.now();
  return {
    id,
    title: 'New Chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
    projectId: null,
  };
}

export const hydrateChatHistory = createAsyncThunk(
  'chat/hydrateChatHistory',
  async () => {
    const data = await loadChatHistory();
    return data;
  }
);

// const BACKEND_URL = 'http://192.168.0.105:8000/chat';
const BACKEND_URL = 'http://192.168.0.105:8000/chat';






export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (userMessage, { rejectWithValue }) => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const firstConversation = createEmptyConversation();

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: {
      [firstConversation.id]: firstConversation,
    },
    projects: {},
    activeConversationId: firstConversation.id,
    loading: false,
    error: null,
    historyLoaded: false,
  },
  reducers: {
    clearChat: (state) => {
      const active = state.conversations[state.activeConversationId];
      if (active) {
        active.messages = [];
        active.title = 'New Chat';
        active.updatedAt = Date.now();
      }
      state.error = null;
    },
    startNewConversation: (state) => {
      const fresh = createEmptyConversation();
      state.conversations[fresh.id] = fresh;
      state.activeConversationId = fresh.id;
    },
    switchConversation: (state, action) => {
      if (state.conversations[action.payload]) {
        state.activeConversationId = action.payload;
      }
    },
    deleteConversation: (state, action) => {
      const idToDelete = action.payload;
      delete state.conversations[idToDelete];
      const remainingIds = Object.keys(state.conversations);

      if (remainingIds.length === 0) {
        const fresh = createEmptyConversation();
        state.conversations[fresh.id] = fresh;
        state.activeConversationId = fresh.id;
      } else if (state.activeConversationId === idToDelete) {
        const mostRecent = remainingIds
          .map((id) => state.conversations[id])
          .sort((a, b) => b.updatedAt - a.updatedAt)[0];
        state.activeConversationId = mostRecent.id;
      }
    },
    renameConversation: (state, action) => {
      const { id, title } = action.payload;
      const conversation = state.conversations[id];
      if (conversation && title && title.trim()) {
        conversation.title = title.trim();
        conversation.updatedAt = Date.now();
      }
    },
    createProject: (state, action) => {
      const { id, name } = action.payload;
      if (id && name && name.trim()) {
        state.projects[id] = { id, name: name.trim(), createdAt: Date.now() };
      }
    },
    addConversationToProject: (state, action) => {
      const { conversationId, projectId } = action.payload;
      const conversation = state.conversations[conversationId];
      if (conversation && state.projects[projectId]) {
        conversation.projectId = projectId;
        conversation.updatedAt = Date.now();
      }
    },
    deleteProject: (state, action) => {
      const projectId = action.payload;
      delete state.projects[projectId];
      Object.values(state.conversations).forEach((conversation) => {
        if (conversation.projectId === projectId) {
          conversation.projectId = null;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateChatHistory.fulfilled, (state, action) => {
        const data = action.payload;
        if (data && data.conversations && Object.keys(data.conversations).length > 0) {
          state.conversations = data.conversations;
          state.activeConversationId =
            data.activeConversationId && data.conversations[data.activeConversationId]
              ? data.activeConversationId
              : Object.keys(data.conversations)[0];
          state.projects = data.projects || {};
        }
        state.historyLoaded = true;
      })
      .addCase(sendMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const active = state.conversations[state.activeConversationId];
        if (active) {
          active.messages.push({
            id: Date.now().toString(),
            text: action.meta.arg,
            sender: 'user',
          });
          if (active.title === 'New Chat') {
            active.title = action.meta.arg.slice(0, 30);
          }
          active.updatedAt = Date.now();
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const active = state.conversations[state.activeConversationId];
        if (active) {
          // Guard against a null/malformed payload (e.g. a backend route
          // that returns nothing) so this can never again throw mid-reducer
          // and silently strand `loading: true` forever.
          const payload = action.payload || {};
          active.messages.push({
            id: (Date.now() + 1).toString(),
            text: payload.response || "Sorry, I didn't get a proper response. Please try again.",
            sender: 'bot',
            source: payload.source,
          });
          active.updatedAt = Date.now();
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        const active = state.conversations[state.activeConversationId];
        if (active) {
          active.messages.push({
            id: (Date.now() + 1).toString(),
            text: 'Sorry, something went wrong. Please try again.',
            sender: 'bot',
            source: 'Error',
          });
          active.updatedAt = Date.now();
        }
      });
  },
});

export const {
  clearChat,
  startNewConversation,
  switchConversation,
  deleteConversation,
  renameConversation,
  createProject,
  addConversationToProject,
  deleteProject,
} = chatSlice.actions;
export default chatSlice.reducer;