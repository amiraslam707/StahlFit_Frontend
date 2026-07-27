import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import React, { useEffect, useRef } from 'react';
import { View, Animated, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import AppNavigator from './navigation/AppNavigator';
import { hydrateChatHistory } from './store/chatSlice';
import { hydrateTheme } from './store/themeSlice';
import { closeDrawer, openDrawer } from './store/uiSlice';
import ConversationDrawer from './components/ConversationDrawer';
import useThemeColors from './hooks/useThemeColors';

const DRAWER_WIDTH = 280;
const EDGE_WIDTH = 24;

function AppContent() {
  const dispatch = useDispatch();
  const isDrawerOpen = useSelector((state) => state.ui.isDrawerOpen);
  const themeMode = useSelector((state) => state.theme.mode);
  const colors = useThemeColors();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const isDrawerOpenRef = useRef(isDrawerOpen);

  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  useEffect(() => {
    dispatch(hydrateChatHistory());
    dispatch(hydrateTheme());
  }, [dispatch]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isDrawerOpen ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) =>
        !isDrawerOpenRef.current && evt.nativeEvent.pageX < EDGE_WIDTH,
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        !isDrawerOpenRef.current &&
        gestureState.x0 < EDGE_WIDTH &&
        gestureState.dx > 5 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (evt, gestureState) => {
        const next = Math.min(0, Math.max(-DRAWER_WIDTH, -DRAWER_WIDTH + gestureState.dx));
        slideAnim.setValue(next);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const shouldOpen = gestureState.dx > DRAWER_WIDTH / 3 || gestureState.vx > 0.5;
        if (shouldOpen) {
          dispatch(openDrawer());
        } else {
          Animated.timing(slideAnim, {
            toValue: -DRAWER_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.flex}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />

      <View style={styles.edgeSwipeZone} {...panResponder.panHandlers} />

      <Animated.View
        pointerEvents={isDrawerOpen ? 'auto' : 'none'}
        style={[
          styles.backdrop,
          {
            opacity: slideAnim.interpolate({
              inputRange: [-DRAWER_WIDTH, 0],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => dispatch(closeDrawer())}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: colors.surface, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <ConversationDrawer onClose={() => dispatch(closeDrawer())} />
      </Animated.View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  edgeSwipeZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: EDGE_WIDTH,
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: DRAWER_WIDTH,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});