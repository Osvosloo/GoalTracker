import 'dotenv/config';

export default {
  expo: {
    name: "Goal Tracker",
    slug: "GoalTrackerApp",
    version: "1.0.0",
    scheme: "myapp",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/app-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.Vossie.GoalTracker"
    },
    web: {
      favicon: "./assets/images/app-icon.png",
      bundler: "metro",
      output: "static"
    },
    extra: {
      eas: {
        projectId: "6d59f83a-1083-4653-b7a0-ed5c9e4310b1" 
      },
      COHERE_API_KEY: process.env.COHERE_API_KEY 
    }
  }
};