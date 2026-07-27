import { saveChatHistory } from './chatStorage';

const PERSIST_ACTIONS = [
  'chat/sendMessage/pending',
  'chat/sendMessage/fulfilled',
  'chat/sendMessage/rejected',
  'chat/clearChat',
  'chat/startNewConversation',
  'chat/switchConversation',
  'chat/deleteConversation',
  'chat/createProject',
  'chat/renameConversation',
  'chat/addConversationToProject',
  'chat/deleteProject',
];

const chatPersistMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (PERSIST_ACTIONS.includes(action.type)) {
    const state = store.getState();
    saveChatHistory(state.chat.conversations, state.chat.activeConversationId, state.chat.projects);
  }

  return result;
};

export default chatPersistMiddleware;