import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

type VideoTransitionContextValue = {
  visible: boolean;
  showVideo: (duration?: number) => void;
  hideVideo: () => void;
};

const VideoTransitionContext = createContext<VideoTransitionContextValue | null>(null);
const SPLASH_DURATION_MS = 3800;

export function VideoTransitionProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(SPLASH_DURATION_MS);
  const startedAtRef = useRef(0);
  const durationRef = useRef(SPLASH_DURATION_MS);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const showVideo = useCallback((durationMs?: number) => {
    const nextDuration = durationMs || SPLASH_DURATION_MS;

    clearHideTimer();
    startedAtRef.current = Date.now();
    durationRef.current = nextDuration;
    setDuration(nextDuration);
    setVisible(true);
  }, [clearHideTimer]);

  const hideVideo = useCallback(() => {
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(durationRef.current - elapsed, 0);

    clearHideTimer();

    if (remaining > 0) {
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
      }, remaining);
      return;
    }

    setVisible(false);
  }, [clearHideTimer]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  return (
    <VideoTransitionContext.Provider value={{ visible, showVideo, hideVideo }}>
      {children}
      <VideoTransitionOverlay visible={visible} onHide={hideVideo} duration={duration} />
    </VideoTransitionContext.Provider>
  );
}

export function useVideoTransition() {
  const context = useContext(VideoTransitionContext);

  if (!context) {
    throw new Error("useVideoTransition must be used within VideoTransitionProvider");
  }

  return context;
}

export function SplashLoading() {
  return (
    <View style={styles.loadingScreen}>
      <Image
        source={require("../../assets/images/splash.gif")}
        style={styles.splashGif}
        resizeMode="contain"
      />
    </View>
  );
}

function VideoTransitionOverlay({
  visible,
  onHide,
  duration,
}: {
  visible: boolean;
  onHide: () => void;
  duration: number;
}) {
  useEffect(() => {
    if (visible) {
      // Auto-hide após a duração especificada
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Image
        source={require("../../assets/images/splash.gif")}
        style={styles.splashGif}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  splashGif: {
    width: "100%",
    height: "100%",
  },
});
