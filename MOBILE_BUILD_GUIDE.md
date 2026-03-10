# BESTA Mobile App — Build & Publish Guide

## Overview

BESTA uses **Capacitor** to wrap the web app into native Android and iOS apps for distribution on Google Play Store and Apple App Store.

---

## Prerequisites

### For Android (Google Play Store)
- [Android Studio](https://developer.android.com/studio) installed on your computer
- [Google Play Developer Account](https://play.google.com/console/) — $25 one-time fee
- Java JDK 17+

### For iOS (Apple App Store)
- A Mac computer with [Xcode](https://developer.apple.com/xcode/) installed
- [Apple Developer Account](https://developer.apple.com/programs/) — $99/year
- CocoaPods (`sudo gem install cocoapods`)

### Common
- Node.js 18+ and npm
- Git

---

## Step 1: Clone & Set Up Locally

```bash
# Clone your Replit project
git clone <your-replit-git-url> besta-app
cd besta-app

# Install dependencies
npm install
```

---

## Step 2: Configure Production API URL

Your mobile app needs to point to your deployed backend. Edit `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'in.besta.app',
  appName: 'BESTA',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // Point to your deployed Replit URL:
    url: 'https://your-app.replit.app',
    cleartext: false,
  },
  // ... rest of config
};
```

**Important:** Replace `https://your-app.replit.app` with your actual published URL.

---

## Step 3: Build the Web App

```bash
npm run build
```

This creates the production build in `dist/public/`.

---

## Step 4: Add Native Platforms

```bash
# Add Android platform
npx cap add android

# Add iOS platform (Mac only)
npx cap add ios

# Sync web build to native projects
npx cap sync
```

---

## Step 5: App Icons & Splash Screen

Before building, replace the placeholder icons with your actual BESTA brand icons.

### Android
Replace files in: `android/app/src/main/res/`
- `mipmap-mdpi/ic_launcher.png` — 48x48
- `mipmap-hdpi/ic_launcher.png` — 72x72
- `mipmap-xhdpi/ic_launcher.png` — 96x96
- `mipmap-xxhdpi/ic_launcher.png` — 144x144
- `mipmap-xxxhdpi/ic_launcher.png` — 192x192

### iOS
Replace files in: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Sizes: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024

**Tip:** Use a tool like [Icon Kitchen](https://icon.kitchen/) or [App Icon Generator](https://www.appicon.co/) to generate all sizes from a single 1024x1024 image.

---

## Step 6A: Build & Publish Android

### Open in Android Studio
```bash
npx cap open android
```

### Generate Signed APK/AAB
1. In Android Studio: **Build → Generate Signed Bundle/APK**
2. Choose **Android App Bundle (AAB)** for Play Store
3. Create a new keystore or use existing one
4. Build the release AAB

### Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console/)
2. Create a new app → Fill in details (title, description, category: Shopping)
3. Upload the AAB under **Production → Create new release**
4. Add screenshots (phone + tablet), feature graphic (1024x500)
5. Complete the content rating questionnaire
6. Set pricing (free) and distribution (India + worldwide)
7. Submit for review (usually 1-3 days)

### Play Store Listing Details
- **App name:** BESTA - Fashion Shopping
- **Short description:** India's fast-fashion destination. Shop Men's, Women's & Kids' trends.
- **Category:** Shopping
- **Content rating:** Everyone

---

## Step 6B: Build & Publish iOS

### Open in Xcode
```bash
npx cap open ios
```

### Configure Signing
1. In Xcode, select the **App** target
2. Under **Signing & Capabilities**, select your Apple Developer Team
3. Set Bundle Identifier to: `in.besta.app`

### Build Archive
1. Select **Any iOS Device** as build target
2. **Product → Archive**
3. In the Organizer, click **Distribute App**
4. Choose **App Store Connect**
5. Upload to App Store Connect

### Submit on App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with bundle ID `in.besta.app`
3. Fill in app information, screenshots (6.7", 6.5", 5.5" iPhones + iPad)
4. Submit for review (usually 1-2 days)

### App Store Listing Details
- **App name:** BESTA - Fashion Shopping
- **Subtitle:** India's Fast Fashion Destination
- **Category:** Shopping
- **Privacy Policy URL:** Required — create one at your domain

---

## Updating the App

After making changes to your web app on Replit:

```bash
# Pull latest changes
git pull

# Build and sync
npm run build
npx cap sync

# Open in IDE and build new release
npx cap open android  # or ios
```

---

## App Configuration Reference

| Setting | Value |
|---------|-------|
| App ID | `in.besta.app` |
| App Name | BESTA |
| Web Directory | `dist/public` |
| Min Android SDK | 22 (Android 5.1) |
| Min iOS Version | 13.0 |
| Status Bar | Light content, black background |

---

## Troubleshooting

### "Network error" on mobile
- Make sure your Replit app is published and the URL in `capacitor.config.ts` is correct
- Check that the app has internet permission (auto-added by Capacitor)

### Blank white screen
- Run `npm run build` before `npx cap sync`
- Check browser console in Android Studio / Xcode for errors

### iOS build fails
- Run `cd ios/App && pod install` to install CocoaPods dependencies
- Make sure Xcode command line tools are installed: `xcode-select --install`
