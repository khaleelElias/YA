# Yazidi Digital Library Mobile App

A multilingual digital library app for the Yazidi community, built with Expo React Native and Supabase.

## 🎉 Current Status: Sprint 1 Complete!

✅ **Modern UI with professional design**
✅ **Complete navigation system** with 4 tabs
✅ **Professional Ionicons** throughout
✅ **Theme system** with warm gold/amber palette
✅ **Ready for real data integration**

See [PROGRESS.md](./docs/PROGRESS.md) for detailed development status.

---

## Features

- **Anonymous Reading**: Browse, download, and read books without creating an account
- **Multi-language Support**: Kurmanji (Latin), Arabic (RTL), English, and German
- **Offline-First**: Download books for offline reading with automatic sync
- **EPUB Reader**: Smooth EPUB rendering with CFI-based progress tracking
- **Teacher/Class Module** (Phase 2): Assign books to classes and track student progress

## Tech Stack

- **Frontend**: Expo React Native (TypeScript)
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Navigation**: React Navigation (Bottom Tabs)
- **Icons**: @expo/vector-icons (Ionicons)
- **Local Storage**: Expo SQLite + FileSystem (Coming in Sprint 3)
- **State Management**: Zustand (Coming in Sprint 2)
- **Localization**: i18next (Coming in Sprint 4)

## Project Structure

```
YA/
├── src/
│   ├── api/              ✅ Supabase API clients
│   ├── navigation/       ✅ React Navigation setup
│   ├── screens/          ✅ All main screens implemented
│   │   ├── home/         ✅ Browse screen with book grid
│   │   ├── downloads/    ✅ Library screen with tabs
│   │   ├── profile/      ✅ Profile screen with settings
│   │   └── search/       ✅ Search screen (placeholder)
│   ├── theme/            ✅ Complete design system
│   │   ├── colors.ts     ✅ Professional color palette
│   │   ├── typography.ts ✅ Typography scale
│   │   ├── spacing.ts    ✅ 8pt spacing grid
│   │   └── shadows.ts    ✅ Shadow definitions
│   ├── types/            ✅ TypeScript type definitions
│   ├── components/       ⏳ To be created in Sprint 2
│   ├── hooks/            ⏳ To be created in Sprint 2
│   ├── store/            ⏳ To be created in Sprint 2
│   ├── services/         ⏳ To be created in Sprint 3
│   └── utils/            ⏳ To be created in Sprint 2
├── supabase/
│   └── migrations/       ✅ Database migrations (ready to run)
├── docs/
│   ├── TECHNICAL_PLAN.md ✅ Complete architecture plan
│   ├── SUPABASE_SETUP.md ✅ Setup guide
│   ├── SETUP.md          ✅ Development setup
│   └── PROGRESS.md       ✅ Development progress tracker
└── App.tsx               ✅ Root component with navigation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo Go app on your phone (or Android/iOS simulator)
- Supabase account: [https://supabase.com](https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/khaleelElias/YA.git
   cd YA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   - The `.env` file already exists with Supabase credentials
   - If you need to update: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. **Set up Supabase** (if not done yet)
   - Create a Supabase project at [https://app.supabase.com](https://app.supabase.com)
   - Run migrations in SQL Editor:
     1. `supabase/migrations/001_initial_schema.sql`
     2. `supabase/migrations/002_rls_policies.sql`
     3. `supabase/migrations/003_storage_setup.sql`
   - See [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for detailed instructions

5. **Run the app**
   ```bash
   npm start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Current Implementation

### ✅ Completed (Sprint 1)

**Design System**
- Professional warm gold/amber color palette (#D4A574)
- Soft gray background (#F5F5F5) - no harsh white
- Complete theme system with colors, typography, spacing, shadows
- Ionicons for all icons (no emojis)

**Navigation**
- React Navigation with bottom tabs
- Four main screens: Browse, Search, Library, Profile
- No forced authentication - anonymous browsing enabled
- TypeScript types for all routes

**HomeScreen (Browse)**
- Search bar with icon
- Horizontal scrolling category filters
- 2-column book grid with colored covers
- Book cards with titles, authors, categories
- EPUB badges and favorite buttons
- View toggle (list/grid)

**Library Screen**
- "My Library" header
- Filter tabs: Reading, Favorites, Downloads, Completed
- List view with book thumbnails
- Empty state with icon
- Favorite buttons

**Profile Screen**
- Welcome section with avatar
- Create Account / Sign In buttons
- Settings cards (Language, Appearance, Storage)
- About section with links
- Version number

**Tab Bar**
- Home, Search, Library, Profile tabs
- Ionicons for all tabs
- Gold active state, gray inactive

### 🚧 Next Up (Sprint 2)

- [ ] Fetch real books from Supabase
- [ ] Display book data in grid
- [ ] Book detail screen
- [ ] Search functionality
- [ ] Category filtering
- [ ] Loading states
- [ ] Error handling

## Development

### Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Code Style

- ESLint and Prettier configured
- TypeScript strict mode enabled
- Path alias: `@/` maps to `src/`
- Use Ionicons from @expo/vector-icons
- Font weights: Use numeric strings ('400', '600', '700')

## Implementation Guardrails

⚠️ **Critical Rules** (Non-negotiable):

1. **EPUB pages are virtual**
   - Progress MUST use CFI (Canonical Fragment Identifier), NOT page numbers

2. **Anonymous/guest reading required**
   - Browse, download, and read without account
   - Authentication only for sync and teacher features

3. **RTL is first-class**
   - Test continuously as screens are built
   - Verify both LTR and RTL layouts

4. **No gamification in v1**
   - Keep scope tight
   - Future scope only

5. **Scope discipline**
   - No feature creep
   - Prefer clarity and maintainability

## Documentation

- [Progress Tracker](./docs/PROGRESS.md) - Current development status
- [Technical Plan](./docs/TECHNICAL_PLAN.md) - Complete architecture
- [Supabase Setup](./docs/SUPABASE_SETUP.md) - Backend setup guide
- [Development Setup](./docs/SETUP.md) - Local setup instructions

## Roadmap

### Sprint 1: Navigation & UI ✅ COMPLETE
- ✅ React Navigation setup
- ✅ Bottom tab navigation
- ✅ All main screens
- ✅ Design system
- ✅ Ionicons implementation

### Sprint 2: Data & Details 🔜 NEXT
- [ ] Fetch books from Supabase
- [ ] Book detail screen
- [ ] Search functionality
- [ ] Category filtering
- [ ] Loading & error states

### Sprint 3: Downloads & Offline
- [ ] Download manager
- [ ] SQLite local storage
- [ ] Offline book access
- [ ] Sync engine

### Sprint 4: Reader & Progress
- [ ] EPUB reader component
- [ ] CFI-based progress tracking
- [ ] Reading interface
- [ ] Bookmarks

### Sprint 5: Authentication
- [ ] Supabase Auth integration
- [ ] Profile management
- [ ] Progress sync
- [ ] Settings persistence

### Phase 2: Teacher/Class Module
- [ ] Teacher dashboard
- [ ] Class management
- [ ] Book assignments
- [ ] Progress tracking

## Testing

- Manual testing checklist in [Technical Plan](./docs/TECHNICAL_PLAN.md)
- Unit tests coming in Sprint 2
- Integration tests coming in Sprint 3

## Contributing

1. Pull latest: `git pull origin main`
2. Create branch: `git checkout -b feature/your-feature`
3. Make changes
4. Test thoroughly
5. Commit: `git commit -m "Your message"`
6. Push: `git push origin main`
7. Update [PROGRESS.md](./docs/PROGRESS.md)

## Repository

**GitHub**: https://github.com/khaleelElias/YA.git
**Latest Commit**: Sprint 1 Complete: Modern UI with Navigation & Professional Icons

---

Built with ❤️ for the Yazidi community

🤖 Generated with [Claude Code](https://claude.com/claude-code)
