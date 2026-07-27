import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { clearChat } from '../store/chatSlice';
import { toggleTheme } from '../store/themeSlice';
import useThemeColors from '../hooks/useThemeColors';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { conversations, activeConversationId } = useSelector((state) => state.chat);
  const messages = conversations[activeConversationId]?.messages || [];
  const themeMode = useSelector((state) => state.theme.mode);
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={() => dispatch(toggleTheme())}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Backend</Text>
            <Text style={styles.value}>FastAPI</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Local Model</Text>
            <Text style={styles.value}>TensorFlow / Keras</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Cloud Fallback</Text>
            <Text style={styles.value}>Google Gemini</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Threshold</Text>
            <Text style={styles.value}>50% confidence</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Backend URL</Text>
            <Text style={styles.value}>192.168.0.105:8000</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Messages Sent</Text>
            <Text style={styles.value}>
              {messages.filter((m) => m.sender === 'user').length}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Total Messages</Text>
            <Text style={styles.value}>{messages.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerButton} onPress={() => dispatch(clearChat())}>
            <Text style={styles.dangerButtonText}>🗑️ Clear Chat History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 16 },
    sectionTitle: {
      fontSize: 13, fontWeight: 'bold', color: colors.primary,
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16, marginLeft: 4,
    },
    card: {
      backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16,
      elevation: 3, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 4,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    divider: { height: 1, backgroundColor: colors.divider },
    label: { fontSize: 15, color: colors.text },
    value: { fontSize: 15, color: colors.primary, fontWeight: '500' },
    dangerButton: { paddingVertical: 14, alignItems: 'center' },
    dangerButtonText: { color: colors.danger, fontSize: 15, fontWeight: 'bold' },
  });
}