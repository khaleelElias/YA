# Development Setup Guide

This guide will help you set up your development environment for the Yazidi Digital Library app.

## Prerequisites

### Required Software

1. **Node.js 18+**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **Expo CLI** (optional, can use npx)
   ```bash
   npm install -g expo-cli
   ```

### Platform-Specific Setup

#### For iOS Development (macOS only)
- Install Xcode from App Store
- Install Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```
- Install CocoaPods:
  ```bash
  sudo gem install cocoapods
  ```

#### For Android Development
- Install Android Studio from [developer.android.com](https://developer.android.com/studio)
- Set up Android emulator in Android Studio
- Add Android SDK to PATH (varies by OS)

## Project Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd YA
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_ENV=development
```

### 3. Supabase Setup

1. **Create Supabase Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Note your project URL and anon key

2. **Run Database Migrations**
   - Open your project in Supabase Dashboard
   - Go to SQL Editor
   - Run each migration file in order:
     1. `supabase/migrations/001_initial_schema.sql`
     2. `supabase/migrations/002_rls_policies.sql`
     3. `supabase/migrations/003_storage_setup.sql`

3. **Verify Setup**
   - Go to Table Editor → Should see `profiles`, `books`, etc.
   - Go to Storage → Should see `book-covers` and `book-files` buckets

### 4. Test the App

```bash
npm start
```

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Development Workflow

### Running the App

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Common Issues

### Port Already in Use

If you see "Port 8081 already in use":
```bash
# Kill process using port 8081
npx kill-port 8081

# Or start on different port
npm start -- --port 8082
```

### Metro Bundler Issues

If you encounter bundler issues:
```bash
# Clear Metro cache
npm start -- --clear

# Or manually clear
rm -rf node_modules/.cache
```

### iOS Simulator Not Found

```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator
open -a Simulator
```

### Android Emulator Issues

1. Open Android Studio
2. Go to AVD Manager
3. Create/start an emulator
4. Run `npm run android`

## IDE Setup

### VS Code (Recommended)

Install these extensions:
- ESLint
- Prettier - Code formatter
- React Native Tools
- TypeScript and JavaScript Language Features

Recommended settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Next Steps

- Read [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) for architecture details
- Check [DATABASE.md](./DATABASE.md) for schema documentation
- Review Sprint 1 tasks in the plan

## Getting Help

- Check existing [GitHub Issues](https://github.com/your-repo/issues)
- Review Expo documentation: [docs.expo.dev](https://docs.expo.dev)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
