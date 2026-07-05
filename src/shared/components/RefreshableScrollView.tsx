import { ReactNode } from 'react';
import { ScrollView, RefreshControl, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface RefreshableScrollViewProps {
  children: ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function RefreshableScrollView({
  children,
  refreshing,
  onRefresh,
  contentContainerStyle,
  style,
}: RefreshableScrollViewProps) {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
});
