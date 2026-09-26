import React, { useState, useRef, useEffect } from 'react';
import Hyperlink from 'react-native-hyperlink';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { sendMessage, clearChat } from '../store/chatSlice';
import { openDrawer } from '../store/uiSlice';
import useThemeColors from '../hooks/useThemeColors';

// Gemini sometimes writes markdown-style links like [text](url) — and for
// video recommendations specifically, it often repeats the URL as both the
// bracket text and the href: [https://...](https://...). react-native-hyperlink
// only understands raw URLs, not markdown syntax, so left alone this renders
// as two separate clickable links glued together with literal [ ] ( ) around
// them. This collapses markdown links into plain text before Hyperlink ever
// sees them: [url](url) -> url, and [Some Title](url) -> "Some Title (url)".
const cleanMarkdownLinks = (text) => {
  if (!text) return text;
  return text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (match, label, url) => (label.trim() === url.trim() ? url : `${label} (${url})`)
  );
};

export default function ChatScreen() {
  // --- TEXT CHAT STATE ---
  const [inputText, setInputText] = useState('');
  const dispatch = useDispatch();
  const { conversations, activeConversationId, loading, error } = useSelector((state) => state.chat);
  const messages = conversations[activeConversationId]?.messages || [];
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const flatListRef = useRef(null);

  // --- VISION STATE ---
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [visionResult, setVisionResult] = useState('');
  const [visionModalVisible, setVisionModalVisible] = useState(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // --- TEXT CHAT LOGIC ---
  const handleSend = () => {
    if (inputText.trim() === '' || loading) return;
    dispatch(sendMessage(inputText.trim()));
    setInputText('');
  };

  // --- LINK HANDLING (shared by chat bubbles + vision modal) ---
  const handleLinkPress = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Cannot open link', url);
        }
      })
      .catch(() => Alert.alert('Error', 'Something went wrong opening that link.'));
  };

  // --- VISION LOGIC ---
  const takeGymPhoto = async () => {
    // 1. Ask the phone for Camera Permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take a picture!');
      return;
    }

    // 2. Open the Camera (bypassing the gallery)
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // <-- THIS FIXES THE CROP FREEZE!
      quality: 0.8,         // Compresses it slightly so it sends faster
    });

    if (!result.canceled) {
      // 3. Send the image to FastAPI! 
      uploadToBackend(result.assets[0].uri);
    }
  };

  const uploadToBackend = async (uri) => {
    setIsUploadingImage(true);
    let formData = new FormData();

    formData.append('file', {
      uri: uri,
      name: 'gym_photo.jpg',
      type: 'image/jpeg',
    });

    // Optional prompt for Gemini
    formData.append('prompt', 'What is this thing in the picture , if its a Gym machine or any other equipment then provide a recommendation for a high-quality YouTube instructional videos for this specific machine, including the video title and a Clickable direct links and any "Websites" Links as well that explains this given object in the picture comprehensively ?');

    try {
      // IMPORTANT: Update this IP to your computer's local Wi-Fi IP address!
      let response = await fetch('https://stahlfitbackend-production.up.railway.app/chat-vision', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      let responseJson = await response.json();

      if (__DEV__) {
        // Check this in your Metro terminal to see the exact raw text
        // Gemini sent back — useful for telling a rendering bug apart
        // from Gemini itself not including a link in its answer.
        console.log('--- Vision response ---\n', responseJson.bot_response);
      }

      // NOTE: Alert.alert() can only show plain text, so it can never make a
      // URL tappable. We show the result in our own modal instead, using the
      // same Hyperlink treatment as the chat bubbles below.
      setVisionResult(cleanMarkdownLinks(responseJson.bot_response) || 'No response received.');
      setVisionModalVisible(true);

    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Could not connect to the backend.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --- RENDER TEXT MESSAGES ---
  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    // User bubbles are already filled with the primary green, so a green link
    // would disappear into the background — use the bubble's own text color
    // there instead, and the brand color on the (lighter) bot bubble.
    const linkStyle = isUser
      ? { color: colors.bubbleUserText, textDecorationLine: 'underline', fontWeight: '700' }
      : { color: colors.primary, textDecorationLine: 'underline', fontWeight: '700' };

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>

        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Hyperlink onPress={handleLinkPress} linkStyle={linkStyle}>
            <Text
              selectable
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.botText,
              ]}
            >
              {cleanMarkdownLinks(item.text)}
            </Text>
          </Hyperlink>

          {!isUser && item.source && (
            <Text style={styles.sourceTag}>
              via {item.source}
            </Text>
          )}
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => dispatch(openDrawer())}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu-outline" size={26} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>StahlFit Chatbot</Text>
        </View>
        <TouchableOpacity onPress={() => dispatch(clearChat())} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>Send a message or upload an image to start!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {(loading || isUploadingImage) && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.typingText}>
              {isUploadingImage ? "AI is analyzing image..." : "AI is thinking..."}
            </Text>
          </View>
        )}

        {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

        <View style={styles.inputContainer}>
          {/* FIX: Changed onPress from pickImage to takeGymPhoto */}
          <TouchableOpacity style={styles.iconButton} onPress={takeGymPhoto} disabled={isUploadingImage}>
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- VISION RESULT MODAL --- 
          Replaces the old Alert.alert popup so links inside the AI's
          response can actually be tapped. Dismiss with Close or the
          Android back button — deliberately no tap-outside-to-dismiss,
          since wrapping this in a Touchable breaks the ScrollView's
          scroll gesture (a known RN issue, not specific to this app). */}
      <Modal
        visible={visionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>AI Vision Analysis</Text>
            <ScrollView style={styles.modalScroll}>
              <Hyperlink onPress={handleLinkPress} linkStyle={styles.modalLink}>
                <Text selectable style={styles.modalText}>
                  {visionResult}
                </Text>
              </Hyperlink>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setVisionModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.headerBackground, paddingHorizontal: 16, paddingVertical: 12,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: colors.headerText, fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
    clearButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    clearText: { color: colors.headerText, fontSize: 14 },
    messagesList: { padding: 16, paddingBottom: 8 },
    messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    avatarText: { fontSize: 16 },
    bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, elevation: 2, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    userBubble: { backgroundColor: colors.bubbleUser, borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: colors.bubbleBot, borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: colors.bubbleUserText },
    botText: { color: colors.bubbleBotText },
    sourceTag: { fontSize: 10, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
    typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
    typingText: { marginLeft: 8, color: colors.textSecondary, fontSize: 14 },
    errorText: { color: colors.danger, textAlign: 'center', paddingHorizontal: 16, paddingVertical: 4, fontSize: 13 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
    iconButton: { marginRight: 10, padding: 4 },
    input: { flex: 1, backgroundColor: colors.inputBackground, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.text, maxHeight: 100, marginRight: 8 },
    sendButton: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, elevation: 3 },
    sendButtonDisabled: { backgroundColor: colors.primaryDisabled },
    sendButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
    // --- Vision result modal ---
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    modalCard: {
      width: '100%',
      maxHeight: '75%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    modalScroll: { marginBottom: 16, flexShrink: 1 },
    modalText: { fontSize: 15, lineHeight: 22, color: colors.text },
    modalLink: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '700' },
    modalCloseButton: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    modalCloseText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  });
}