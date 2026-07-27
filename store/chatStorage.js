import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ai_chat_conversations';
const OLD_STORAGE_KEY = '@AIChat:chatHistory';
const MIGRATION_FLAG_KEY = '@ai_chat_migrated_v1';

function buildConversationFromOldMessages(oldMessages) {
  const now = Date.now();
  const firstUserMessage = oldMessages.find((m) => m.sender === 'user');
  return {
    id: `migrated_${now}`,
    title: firstUserMessage ? firstUserMessage.text.slice(0, 30) : 'Old Chat',
    messages: oldMessages,
    createdAt: now,
    updatedAt: now,
    projectId: null,
  };
}

async function migrateOldHistoryIfNeeded(currentData) {
  const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
  if (alreadyMigrated) return currentData;

  const oldRaw = await AsyncStorage.getItem(OLD_STORAGE_KEY);
  await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');

  if (!oldRaw) return currentData;

  let oldMessages;
  try {
    oldMessages = JSON.parse(oldRaw);
  } catch (e) {
    return currentData;
  }
  if (!Array.isArray(oldMessages) || oldMessages.length === 0) {
    return currentData;
  }

  const migrated = buildConversationFromOldMessages(oldMessages);
  const base =
    currentData && currentData.conversations
      ? currentData
      : { conversations: {}, activeConversationId: null, projects: {} };

  return {
    conversations: { ...base.conversations, [migrated.id]: migrated },
    activeConversationId: migrated.id,
    projects: base.projects || {},
  };
}

export async function loadChatHistory() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    let current = null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.conversations) {
        current = { ...parsed, projects: parsed.projects || {} };
      }
    }

    const merged = await migrateOldHistoryIfNeeded(current);

    if (merged && merged !== current) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }

    return merged;
  } catch (error) {
    console.log('Failed to load chat history:', error);
    return null;
  }
}

export async function saveChatHistory(conversations, activeConversationId, projects) {
  try {
    const payload = JSON.stringify({ conversations, activeConversationId, projects });
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.log('Failed to save chat history:', error);
  }
}