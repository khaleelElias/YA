# Yazidi Digital Library Mobile App

A multilingual digital library app for the Yazidi community, built with Expo React Native and Supabase.

## Features

- **Anonymous Reading**: Browse, download, and read books without creating an account
- **Multi-language Support**: Kurmanji (Latin), Arabic (RTL), English, and German
- **Offline-First**: Download books for offline reading with automatic sync
- **EPUB Reader**: Smooth EPUB rendering with CFI-based progress tracking
- **Teacher/Class Module** (Phase 2): Assign books to classes and track student progress

## Tech Stack

- **Frontend**: Expo React Native (TypeScript)
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Local Storage**: Expo SQLite + FileSystem
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Localization**: i18next

## Project Structure

```
C:\YA\
├── src/
│   ├── api/              # Supabase API clients
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── services/         # Business logic services
│   │   ├── database/     # SQLite operations
│   │   ├── sync/         # Sync engine
│   │   ├── download/     # Download manager
│   │   └── reader/       # EPUB service
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── theme/            # Styling and theme
├── assets/               # Static assets
│   ├── images/           # App icons, splash screens
│   └── translations/     # i18n translation files
├── supabase/
│   └── migrations/       # Database migrations
├── docs/                 # Documentation
└── __tests__/            # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Supabase account: [https://supabase.com](https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd YA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

4. **Set up Supabase**
   - Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
   - Run migrations in the SQL Editor:
     1. `supabase/migrations/001_initial_schema.sql`
     2. `supabase/migrations/002_rls_policies.sql`
     3. `supabase/migrations/003_storage_setup.sql`

5. **Run the app**
   ```bash
   npm start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Development

### Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

### Code Style

- ESLint and Prettier are configured for consistent code style
- TypeScript strict mode is enabled
- Use path aliases: `@/` maps to `src/`

## Implementation Guardrails

⚠️ **Critical Rules** (Non-negotiable):

1. **EPUB pages are virtual**
   - `page_count` is informational only
   - Progress tracking MUST use CFI (Canonical Fragment Identifier), NOT page numbers

2. **Anonymous/guest reading required**
   - Browse, download, and read without account
   - Authentication only for sync, bookmarks, and teacher features

3. **RTL is first-class**
   - Test continuously as screens are built
   - Verify both LTR and RTL layouts for all new UI

4. **Gamification is future scope only**
   - No learning tasks, quizzes, points, or levels in v1
   - Schema designed to support future additions

5. **Scope discipline**
   - No feature creep
   - Prefer clarity and maintainability over clever abstractions

## Documentation

- [Technical Plan](./docs/TECHNICAL_PLAN.md) - Complete architecture and implementation plan
- [Database Schema](./docs/TECHNICAL_PLAN.md#3-database-schema) - Full schema with RLS policies
- [Offline Strategy](./docs/TECHNICAL_PLAN.md#6-offline-strategy) - Sync logic and conflict resolution
- [UI Flows](./docs/TECHNICAL_PLAN.md#7-ui-flows--user-journeys) - User journey documentation

## Roadmap

### Phase 1 (v1) - MVP (Current)
- Anonymous reading
- Multi-language support with RTL
- Offline downloads and reading
- EPUB reader with CFI-based progress
- Basic search and categories

### Phase 2 - Teacher/Class Module
- Teacher dashboard
- Class creation and management
- Book assignments with due dates
- Student progress tracking

### Phase 3 - Advanced Features
- Annotations and highlights
- Reading statistics
- Favorites and collections
- Web admin panel

### Phase 4 - Learning & Gamification
- Vocabulary exercises
- Comprehension quizzes
- Points and levels
- Achievement badges

## Testing

- Unit tests for services, hooks, and utils
- Integration tests for critical user flows
- Manual testing checklist in [Technical Plan](./docs/TECHNICAL_PLAN.md#9-testing--quality-guardrails)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit with descriptive message
6. Push and create a pull request

## License

[Add license information]

## Contact

[Add contact information]

---

Built with ❤️ for the Yazidi community

🤖 Generated with [Claude Code](https://claude.com/claude-code)
