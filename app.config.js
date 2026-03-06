export default {
  expo: {
    name: "TindaTrack",
    slug: "tindatrack",
    scheme: "tindatrack",
    version: "1.0.0",
    web: {
      favicon: "./assets/favicon.png",
    },
    experiments: {
      tsconfigPaths: true,
    },
    plugins: ["expo-router", "expo-sharing", "expo-font"],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.deceive0112.tindatrack",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      versionCode: 5,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://bzqwwrwuhiquntoevyha.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cXd3cnd1aGlxdW50b2V2eWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzEyOTMsImV4cCI6MjA4ODIwNzI5M30.p7ntwFnI0dTXkKPVyVYGFmKdSPL6usSN-2jdpJx8sRQ",
      router: {},
      eas: {
        projectId: "2284143b-c8d1-4591-b67a-e5793b9bec6d",
      },
    },
  },
};
