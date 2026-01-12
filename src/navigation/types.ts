import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Main Tab Navigator Params
export type MainTabParamList = {
  Browse: undefined;
  Search: undefined;
  Downloads: undefined;
  Profile: undefined;
};

// Stack Navigator Params for Browse Tab
export type BrowseStackParamList = {
  BrowseHome: undefined;
  Category: { categoryId: string; categoryName: string };
  BookDetail: { bookId: string };
  Reader: { bookId: string };
};

// Auth Stack Navigator Params
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Root Navigator Params
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

// Screen Props Types
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type BrowseStackScreenProps<T extends keyof BrowseStackParamList> =
  StackScreenProps<BrowseStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

// Navigation Prop Types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
