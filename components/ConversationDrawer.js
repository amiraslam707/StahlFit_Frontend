// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Modal,
//   Pressable,
//   TextInput,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useSelector, useDispatch } from 'react-redux';
// import { Ionicons } from '@expo/vector-icons';
// import {
//   startNewConversation,
//   switchConversation,
//   deleteConversation,
//   renameConversation,
//   createProject,
//   addConversationToProject,
// } from '../store/chatSlice';
// import useThemeColors from '../hooks/useThemeColors';

// function ConversationRow({ item, isActive, colors, styles, onSelect, onLongPress }) {
//   return (
//     <TouchableOpacity
//       style={[styles.row, isActive && styles.rowActive]}
//       onPress={() => onSelect(item.id)}
//       onLongPress={() => onLongPress(item)}
//     >
//       <Ionicons
//         name="chatbubble-outline"
//         size={18}
//         color={isActive ? colors.primary : colors.textSecondary}
//         style={styles.rowIcon}
//       />
//       <Text style={[styles.rowText, isActive && styles.rowTextActive]} numberOfLines={1}>
//         {item.title}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// export default function ConversationDrawer({ onClose }) {
//   const dispatch = useDispatch();
//   const conversations = useSelector((state) => state.chat.conversations);
//   const projects = useSelector((state) => state.chat.projects);
//   const activeConversationId = useSelector((state) => state.chat.activeConversationId);
//   const colors = useThemeColors();
//   const styles = getStyles(colors);

//   const [searchActive, setSearchActive] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [expandedProjects, setExpandedProjects] = useState({});
//   const [actionSheetFor, setActionSheetFor] = useState(null);
//   const [projectPickerFor, setProjectPickerFor] = useState(null);
//   const [promptModal, setPromptModal] = useState(null);
//   const [promptValue, setPromptValue] = useState('');

//   const allConversations = Object.values(conversations);
//   const projectList = Object.values(projects).sort((a, b) => b.createdAt - a.createdAt);

//   const isSearching = searchActive && searchQuery.trim() !== '';
//   const filteredConversations = isSearching
//     ? allConversations.filter((c) =>
//         c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
//       )
//     : [];

//   const recentConversations = allConversations
//     .filter((c) => !c.projectId)
//     .sort((a, b) => b.updatedAt - a.updatedAt);

//   function conversationsForProject(projectId) {
//     return allConversations
//       .filter((c) => c.projectId === projectId)
//       .sort((a, b) => b.updatedAt - a.updatedAt);
//   }

//   const toggleProjectExpanded = (projectId) => {
//     setExpandedProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
//   };

//   const handleNewChat = () => {
//     dispatch(startNewConversation());
//     onClose();
//   };

//   const handleSelect = (id) => {
//     dispatch(switchConversation(id));
//     onClose();
//   };

//   const closeActionSheet = () => setActionSheetFor(null);
//   const closeProjectPicker = () => setProjectPickerFor(null);
//   const closePromptModal = () => {
//     setPromptModal(null);
//     setPromptValue('');
//   };

//   const handleOpenRename = () => {
//     const conv = actionSheetFor;
//     setActionSheetFor(null);
//     setPromptValue(conv.title);
//     setPromptModal({
//       mode: 'rename',
//       conversationId: conv.id,
//       title: 'Rename conversation',
//       placeholder: 'Conversation name',
//       confirmLabel: 'Save',
//     });
//   };

//   const handleOpenProjectPicker = () => {
//     const conv = actionSheetFor;
//     setActionSheetFor(null);
//     setProjectPickerFor(conv);
//   };

//   const handleDeleteFromSheet = () => {
//     const conv = actionSheetFor;
//     setActionSheetFor(null);
//     Alert.alert('Delete conversation', `Delete "${conv.title}"? This can't be undone.`, [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteConversation(conv.id)) },
//     ]);
//   };

//   const handleAssignToProject = (projectId) => {
//     dispatch(addConversationToProject({ conversationId: projectPickerFor.id, projectId }));
//     setProjectPickerFor(null);
//   };

//   const handleStartNewProjectFlow = () => {
//     const conv = projectPickerFor;
//     setProjectPickerFor(null);
//     setPromptValue('');
//     setPromptModal({
//       mode: 'newProject',
//       forConversationId: conv.id,
//       title: 'New project',
//       placeholder: 'Project name',
//       confirmLabel: 'Create',
//     });
//   };

//   const handlePromptConfirm = () => {
//     const trimmed = promptValue.trim();
//     if (!trimmed || !promptModal) return;

//     if (promptModal.mode === 'rename') {
//       dispatch(renameConversation({ id: promptModal.conversationId, title: trimmed }));
//     } else if (promptModal.mode === 'newProject') {
//       const newProjectId = `project_${Date.now()}`;
//       dispatch(createProject({ id: newProjectId, name: trimmed }));
//       if (promptModal.forConversationId) {
//         dispatch(
//           addConversationToProject({
//             conversationId: promptModal.forConversationId,
//             projectId: newProjectId,
//           })
//         );
//       }
//     }
//     closePromptModal();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerRow}>
//         {searchActive ? (
//           <View style={styles.searchBar}>
//             <Ionicons name="search-outline" size={18} color={colors.textMuted} />
//             <TextInput
//               style={styles.searchInput}
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               placeholder="Search conversations"
//               placeholderTextColor={colors.textMuted}
//               autoFocus
//             />
//             <TouchableOpacity
//               onPress={() => {
//                 setSearchActive(false);
//                 setSearchQuery('');
//               }}
//             >
//               <Ionicons name="close" size={18} color={colors.textMuted} />
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <TouchableOpacity
//             onPress={() => setSearchActive(true)}
//             style={styles.searchButton}
//             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//           >
//             <Ionicons name="search-outline" size={20} color={colors.text} />
//           </TouchableOpacity>
//         )}
//       </View>

//       <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
//         <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
//         <Text style={styles.newChatText}>New Chat</Text>
//       </TouchableOpacity>

//       <ScrollView contentContainerStyle={styles.list}>
//         {isSearching ? (
//           filteredConversations.length === 0 ? (
//             <Text style={styles.emptyText}>No matching conversations</Text>
//           ) : (
//             filteredConversations.map((item) => (
//               <ConversationRow
//                 key={item.id}
//                 item={item}
//                 isActive={item.id === activeConversationId}
//                 colors={colors}
//                 styles={styles}
//                 onSelect={handleSelect}
//                 onLongPress={setActionSheetFor}
//               />
//             ))
//           )
//         ) : (
//           <>
//             {projectList.length > 0 && (
//               <>
//                 <Text style={styles.sectionHeader}>Projects</Text>
//                 {projectList.map((project) => {
//                   const projectConvos = conversationsForProject(project.id);
//                   const isExpanded = !!expandedProjects[project.id];
//                   return (
//                     <View key={project.id}>
//                       <TouchableOpacity
//                         style={styles.projectRow}
//                         onPress={() => toggleProjectExpanded(project.id)}
//                       >
//                         <Ionicons
//                           name={isExpanded ? 'folder-open-outline' : 'folder-outline'}
//                           size={18}
//                           color={colors.textSecondary}
//                           style={styles.rowIcon}
//                         />
//                         <Text style={styles.projectRowText} numberOfLines={1}>
//                           {project.name}
//                         </Text>
//                         <Ionicons
//                           name={isExpanded ? 'chevron-down' : 'chevron-forward'}
//                           size={16}
//                           color={colors.textMuted}
//                         />
//                       </TouchableOpacity>
//                       {isExpanded &&
//                         projectConvos.map((item) => (
//                           <View key={item.id} style={styles.nestedRow}>
//                             <ConversationRow
//                               item={item}
//                               isActive={item.id === activeConversationId}
//                               colors={colors}
//                               styles={styles}
//                               onSelect={handleSelect}
//                               onLongPress={setActionSheetFor}
//                             />
//                           </View>
//                         ))}
//                     </View>
//                   );
//                 })}
//               </>
//             )}

//             <Text style={styles.sectionHeader}>Recents</Text>
//             {recentConversations.length === 0 ? (
//               <Text style={styles.emptyText}>No conversations yet</Text>
//             ) : (
//               recentConversations.map((item) => (
//                 <ConversationRow
//                   key={item.id}
//                   item={item}
//                   isActive={item.id === activeConversationId}
//                   colors={colors}
//                   styles={styles}
//                   onSelect={handleSelect}
//                   onLongPress={setActionSheetFor}
//                 />
//               ))
//             )}
//           </>
//         )}
//       </ScrollView>

//       <Modal visible={!!actionSheetFor} transparent animationType="fade" onRequestClose={closeActionSheet}>
//         <Pressable style={styles.modalBackdrop} onPress={closeActionSheet}>
//           <Pressable style={styles.actionSheet} onPress={() => {}}>
//             <Text style={styles.actionSheetTitle} numberOfLines={1}>
//               {actionSheetFor?.title}
//             </Text>
//             <TouchableOpacity style={styles.actionRow} onPress={handleOpenProjectPicker}>
//               <Ionicons name="folder-outline" size={20} color={colors.text} />
//               <Text style={styles.actionRowText}>Add to project</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionRow} onPress={handleOpenRename}>
//               <Ionicons name="pencil-outline" size={20} color={colors.text} />
//               <Text style={styles.actionRowText}>Rename</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionRow} onPress={handleDeleteFromSheet}>
//               <Ionicons name="trash-outline" size={20} color={colors.danger} />
//               <Text style={[styles.actionRowText, { color: colors.danger }]}>Delete</Text>
//             </TouchableOpacity>
//           </Pressable>
//         </Pressable>
//       </Modal>

//       <Modal visible={!!projectPickerFor} transparent animationType="fade" onRequestClose={closeProjectPicker}>
//         <Pressable style={styles.modalBackdrop} onPress={closeProjectPicker}>
//           <Pressable style={styles.actionSheet} onPress={() => {}}>
//             <Text style={styles.actionSheetTitle}>Add to project</Text>
//             {projectList.length === 0 && (
//               <Text style={styles.emptyProjectsText}>No projects yet</Text>
//             )}
//             {projectList.map((project) => (
//               <TouchableOpacity
//                 key={project.id}
//                 style={styles.actionRow}
//                 onPress={() => handleAssignToProject(project.id)}
//               >
//                 <Ionicons name="folder-outline" size={20} color={colors.text} />
//                 <Text style={styles.actionRowText}>{project.name}</Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity style={styles.actionRow} onPress={handleStartNewProjectFlow}>
//               <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
//               <Text style={[styles.actionRowText, { color: colors.primary }]}>New project</Text>
//             </TouchableOpacity>
//           </Pressable>
//         </Pressable>
//       </Modal>

//       <Modal visible={!!promptModal} transparent animationType="fade" onRequestClose={closePromptModal}>
//         <Pressable style={styles.modalBackdropCenter} onPress={closePromptModal}>
//           <Pressable style={styles.promptSheet} onPress={() => {}}>
//             <Text style={styles.actionSheetTitle}>{promptModal?.title}</Text>
//             <TextInput
//               style={styles.promptInput}
//               value={promptValue}
//               onChangeText={setPromptValue}
//               placeholder={promptModal?.placeholder}
//               placeholderTextColor={colors.textMuted}
//               autoFocus
//             />
//             <View style={styles.promptButtonRow}>
//               <TouchableOpacity style={styles.promptCancelButton} onPress={closePromptModal}>
//                 <Text style={styles.promptCancelText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.promptConfirmButton} onPress={handlePromptConfirm}>
//                 <Text style={styles.promptConfirmText}>{promptModal?.confirmLabel || 'Save'}</Text>
//               </TouchableOpacity>
//             </View>
//           </Pressable>
//         </Pressable>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// function getStyles(colors) {
//   return StyleSheet.create({
//     container: { flex: 1, backgroundColor: colors.surface },
//     headerRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, paddingTop: 12 },
//     searchButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
//     searchBar: {
//       flex: 1, flexDirection: 'row', alignItems: 'center',
//       backgroundColor: colors.inputBackground, borderRadius: 10, paddingHorizontal: 10, height: 36,
//     },
//     searchInput: { flex: 1, marginLeft: 8, marginRight: 8, color: colors.text, fontSize: 14, padding: 0 },
//     newChatButton: {
//       flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
//       marginHorizontal: 12, marginTop: 10, marginBottom: 4, padding: 12, borderRadius: 10,
//     },
//     newChatText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 8, fontSize: 15 },
//     list: { paddingHorizontal: 8, paddingBottom: 24 },
//     sectionHeader: {
//       fontSize: 12, fontWeight: '600', color: colors.textMuted,
//       textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 18, marginBottom: 6, marginLeft: 10,
//     },
//     emptyText: { fontSize: 13, color: colors.textMuted, marginLeft: 10, marginTop: 4, marginBottom: 8 },
//     row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
//     rowActive: { backgroundColor: colors.primaryMuted },
//     rowIcon: { marginRight: 10 },
//     rowText: { flex: 1, fontSize: 14, color: colors.text },
//     rowTextActive: { color: colors.primary, fontWeight: '600' },
//     nestedRow: { marginLeft: 16 },
//     projectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
//     projectRowText: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
//     modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
//     modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
//     actionSheet: {
//       backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18,
//       paddingTop: 8, paddingBottom: 24, paddingHorizontal: 8,
//     },
//     actionSheetTitle: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 14, paddingVertical: 10 },
//     actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 10 },
//     actionRowText: { fontSize: 15, color: colors.text, marginLeft: 12 },
//     emptyProjectsText: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 14, paddingBottom: 8 },
//     promptSheet: { backgroundColor: colors.surface, borderRadius: 16, width: '85%', padding: 18 },
//     promptInput: {
//       borderWidth: 1, borderColor: colors.border, borderRadius: 10,
//       paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text,
//       marginTop: 12, marginBottom: 16, backgroundColor: colors.inputBackground,
//     },
//     promptButtonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
//     promptCancelButton: { paddingVertical: 10, paddingHorizontal: 16 },
//     promptCancelText: { color: colors.textSecondary, fontSize: 15 },
//     promptConfirmButton: { paddingVertical: 10, paddingHorizontal: 16 },
//     promptConfirmText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
//   });
// }











import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  startNewConversation,
  switchConversation,
  deleteConversation,
  renameConversation,
  createProject,
  addConversationToProject,
  deleteProject,
} from '../store/chatSlice';
import useThemeColors from '../hooks/useThemeColors';

function ConversationRow({ item, isActive, colors, styles, onSelect, onLongPress }) {
  return (
    <TouchableOpacity
      style={[styles.row, isActive && styles.rowActive]}
      onPress={() => onSelect(item.id)}
      onLongPress={() => onLongPress(item)}
    >
      <Ionicons
        name="chatbubble-outline"
        size={18}
        color={isActive ? colors.primary : colors.textSecondary}
        style={styles.rowIcon}
      />
      <Text style={[styles.rowText, isActive && styles.rowTextActive]} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

export default function ConversationDrawer({ onClose }) {
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.chat.conversations);
  const projects = useSelector((state) => state.chat.projects);
  const activeConversationId = useSelector((state) => state.chat.activeConversationId);
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [actionSheetFor, setActionSheetFor] = useState(null);
  const [projectActionSheetFor, setProjectActionSheetFor] = useState(null);
  const [projectPickerFor, setProjectPickerFor] = useState(null);
  const [promptModal, setPromptModal] = useState(null);
  const [promptValue, setPromptValue] = useState('');

  const allConversations = Object.values(conversations);
  const projectList = Object.values(projects).sort((a, b) => b.createdAt - a.createdAt);

  const isSearching = searchActive && searchQuery.trim() !== '';
  const filteredConversations = isSearching
    ? allConversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  const recentConversations = allConversations
    .filter((c) => !c.projectId)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  function conversationsForProject(projectId) {
    return allConversations
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  const toggleProjectExpanded = (projectId) => {
    setExpandedProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const handleNewChat = () => {
    dispatch(startNewConversation());
    onClose();
  };

  const handleSelect = (id) => {
    dispatch(switchConversation(id));
    onClose();
  };

  const closeActionSheet = () => setActionSheetFor(null);
  const closeProjectActionSheet = () => setProjectActionSheetFor(null);
  const closeProjectPicker = () => setProjectPickerFor(null);
  const closePromptModal = () => {
    setPromptModal(null);
    setPromptValue('');
  };

  const handleOpenRename = () => {
    const conv = actionSheetFor;
    setActionSheetFor(null);
    setPromptValue(conv.title);
    setPromptModal({
      mode: 'rename',
      conversationId: conv.id,
      title: 'Rename conversation',
      placeholder: 'Conversation name',
      confirmLabel: 'Save',
    });
  };

  const handleOpenProjectPicker = () => {
    const conv = actionSheetFor;
    setActionSheetFor(null);
    setProjectPickerFor(conv);
  };

  const handleDeleteFromSheet = () => {
    const conv = actionSheetFor;
    setActionSheetFor(null);
    Alert.alert('Delete conversation', `Delete "${conv.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteConversation(conv.id)) },
    ]);
  };

  const handleDeleteProject = () => {
    const project = projectActionSheetFor;
    setProjectActionSheetFor(null);
    Alert.alert(
      'Delete project',
      `Delete "${project.name}"? Its conversations will move back to Recents, not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteProject(project.id)) },
      ]
    );
  };

  const handleAssignToProject = (projectId) => {
    dispatch(addConversationToProject({ conversationId: projectPickerFor.id, projectId }));
    setProjectPickerFor(null);
  };

  const handleStartNewProjectFlow = () => {
    const conv = projectPickerFor;
    setProjectPickerFor(null);
    setPromptValue('');
    setPromptModal({
      mode: 'newProject',
      forConversationId: conv.id,
      title: 'New project',
      placeholder: 'Project name',
      confirmLabel: 'Create',
    });
  };

  const handleStartStandaloneNewProject = () => {
    setPromptValue('');
    setPromptModal({
      mode: 'newProject',
      forConversationId: null,
      title: 'New project',
      placeholder: 'Project name',
      confirmLabel: 'Create',
    });
  };

  const handlePromptConfirm = () => {
    const trimmed = promptValue.trim();
    if (!trimmed || !promptModal) return;

    if (promptModal.mode === 'rename') {
      dispatch(renameConversation({ id: promptModal.conversationId, title: trimmed }));
    } else if (promptModal.mode === 'newProject') {
      const newProjectId = `project_${Date.now()}`;
      dispatch(createProject({ id: newProjectId, name: trimmed }));
      if (promptModal.forConversationId) {
        dispatch(
          addConversationToProject({
            conversationId: promptModal.forConversationId,
            projectId: newProjectId,
          })
        );
      }
    }
    closePromptModal();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        {searchActive ? (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conversations"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setSearchActive(false);
                setSearchQuery('');
              }}
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setSearchActive(true)}
            style={styles.searchButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.list}>
        {isSearching ? (
          filteredConversations.length === 0 ? (
            <Text style={styles.emptyText}>No matching conversations</Text>
          ) : (
            filteredConversations.map((item) => (
              <ConversationRow
                key={item.id}
                item={item}
                isActive={item.id === activeConversationId}
                colors={colors}
                styles={styles}
                onSelect={handleSelect}
                onLongPress={setActionSheetFor}
              />
            ))
          )
        ) : (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>Projects</Text>
              <TouchableOpacity
                onPress={handleStartStandaloneNewProject}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {projectList.map((project) => {
              const projectConvos = conversationsForProject(project.id);
              const isExpanded = !!expandedProjects[project.id];
              return (
                <View key={project.id}>
                  <TouchableOpacity
                    style={styles.projectRow}
                    onPress={() => toggleProjectExpanded(project.id)}
                    onLongPress={() => setProjectActionSheetFor(project)}
                  >
                    <Ionicons
                      name={isExpanded ? 'folder-open-outline' : 'folder-outline'}
                      size={18}
                      color={colors.textSecondary}
                      style={styles.rowIcon}
                    />
                    <Text style={styles.projectRowText} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                  {isExpanded &&
                    projectConvos.map((item) => (
                      <View key={item.id} style={styles.nestedRow}>
                        <ConversationRow
                          item={item}
                          isActive={item.id === activeConversationId}
                          colors={colors}
                          styles={styles}
                          onSelect={handleSelect}
                          onLongPress={setActionSheetFor}
                        />
                      </View>
                    ))}
                </View>
              );
            })}

            <Text style={styles.sectionHeader}>Recents</Text>
            {recentConversations.length === 0 ? (
              <Text style={styles.emptyText}>No conversations yet</Text>
            ) : (
              recentConversations.map((item) => (
                <ConversationRow
                  key={item.id}
                  item={item}
                  isActive={item.id === activeConversationId}
                  colors={colors}
                  styles={styles}
                  onSelect={handleSelect}
                  onLongPress={setActionSheetFor}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={!!actionSheetFor} transparent animationType="fade" onRequestClose={closeActionSheet}>
        <Pressable style={styles.modalBackdrop} onPress={closeActionSheet}>
          <Pressable style={styles.actionSheet} onPress={() => {}}>
            <Text style={styles.actionSheetTitle} numberOfLines={1}>
              {actionSheetFor?.title}
            </Text>
            <TouchableOpacity style={styles.actionRow} onPress={handleOpenProjectPicker}>
              <Ionicons name="folder-outline" size={20} color={colors.text} />
              <Text style={styles.actionRowText}>Add to project</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} onPress={handleOpenRename}>
              <Ionicons name="pencil-outline" size={20} color={colors.text} />
              <Text style={styles.actionRowText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} onPress={handleDeleteFromSheet}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
              <Text style={[styles.actionRowText, { color: colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!projectActionSheetFor} transparent animationType="fade" onRequestClose={closeProjectActionSheet}>
        <Pressable style={styles.modalBackdrop} onPress={closeProjectActionSheet}>
          <Pressable style={styles.actionSheet} onPress={() => {}}>
            <Text style={styles.actionSheetTitle} numberOfLines={1}>
              {projectActionSheetFor?.name}
            </Text>
            <TouchableOpacity style={styles.actionRow} onPress={handleDeleteProject}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
              <Text style={[styles.actionRowText, { color: colors.danger }]}>Delete project</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!projectPickerFor} transparent animationType="fade" onRequestClose={closeProjectPicker}>
        <Pressable style={styles.modalBackdrop} onPress={closeProjectPicker}>
          <Pressable style={styles.actionSheet} onPress={() => {}}>
            <Text style={styles.actionSheetTitle}>Add to project</Text>
            {projectList.length === 0 && (
              <Text style={styles.emptyProjectsText}>No projects yet</Text>
            )}
            {projectList.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.actionRow}
                onPress={() => handleAssignToProject(project.id)}
              >
                <Ionicons name="folder-outline" size={20} color={colors.text} />
                <Text style={styles.actionRowText}>{project.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.actionRow} onPress={handleStartNewProjectFlow}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionRowText, { color: colors.primary }]}>New project</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!promptModal} transparent animationType="fade" onRequestClose={closePromptModal}>
        <Pressable style={styles.modalBackdropCenter} onPress={closePromptModal}>
          <Pressable style={styles.promptSheet} onPress={() => {}}>
            <Text style={styles.actionSheetTitle}>{promptModal?.title}</Text>
            <TextInput
              style={styles.promptInput}
              value={promptValue}
              onChangeText={setPromptValue}
              placeholder={promptModal?.placeholder}
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.promptButtonRow}>
              <TouchableOpacity style={styles.promptCancelButton} onPress={closePromptModal}>
                <Text style={styles.promptCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.promptConfirmButton} onPress={handlePromptConfirm}>
                <Text style={styles.promptConfirmText}>{promptModal?.confirmLabel || 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    headerRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, paddingTop: 12 },
    searchButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    searchBar: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.inputBackground, borderRadius: 10, paddingHorizontal: 10, height: 36,
    },
    searchInput: { flex: 1, marginLeft: 8, marginRight: 8, color: colors.text, fontSize: 14, padding: 0 },
    newChatButton: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
      marginHorizontal: 12, marginTop: 10, marginBottom: 4, padding: 12, borderRadius: 10,
    },
    newChatText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 8, fontSize: 15 },
    list: { paddingHorizontal: 8, paddingBottom: 24 },
    sectionHeader: {
      fontSize: 12, fontWeight: '600', color: colors.textMuted,
      textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 18, marginBottom: 6, marginLeft: 10,
    },
    sectionHeaderRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 18, marginBottom: 6, marginLeft: 10, marginRight: 6,
    },
    sectionHeaderText: {
      fontSize: 12, fontWeight: '600', color: colors.textMuted,
      textTransform: 'uppercase', letterSpacing: 0.5,
    },
    emptyText: { fontSize: 13, color: colors.textMuted, marginLeft: 10, marginTop: 4, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
    rowActive: { backgroundColor: colors.primaryMuted },
    rowIcon: { marginRight: 10 },
    rowText: { flex: 1, fontSize: 14, color: colors.text },
    rowTextActive: { color: colors.primary, fontWeight: '600' },
    nestedRow: { marginLeft: 16 },
    projectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
    projectRowText: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    actionSheet: {
      backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18,
      paddingTop: 8, paddingBottom: 24, paddingHorizontal: 8,
    },
    actionSheetTitle: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 14, paddingVertical: 10 },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 10 },
    actionRowText: { fontSize: 15, color: colors.text, marginLeft: 12 },
    emptyProjectsText: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 14, paddingBottom: 8 },
    promptSheet: { backgroundColor: colors.surface, borderRadius: 16, width: '85%', padding: 18 },
    promptInput: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text,
      marginTop: 12, marginBottom: 16, backgroundColor: colors.inputBackground,
    },
    promptButtonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
    promptCancelButton: { paddingVertical: 10, paddingHorizontal: 16 },
    promptCancelText: { color: colors.textSecondary, fontSize: 15 },
    promptConfirmButton: { paddingVertical: 10, paddingHorizontal: 16 },
    promptConfirmText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  });
}