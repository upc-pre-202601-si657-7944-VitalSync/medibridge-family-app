import { TouchableOpacity, Text, StyleSheet, View, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { colors, radius, spacing, fontFamily, fontFamilySemiBold } from '../theme';

interface Option { value: string; label: string }
interface SelectProps { label?: string; options: Option[]; value: string; onChange: (value: string) => void; placeholder?: string }

export function Select({ label, options, value, onChange, placeholder }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback((itemValue: string) => {
    onChange(itemValue);
    setIsOpen(false);
  }, [onChange]);

  const renderItem = useCallback(({ item }: { item: Option }) => (
    <TouchableOpacity
      style={[styles.option, item.value === value && styles.optionActive]}
      onPress={() => handleSelect(item.value)}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: item.value === value }}
    >
      <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>{item.label}</Text>
      {item.value === value && <Feather name="check" size={18} color={colors.primary} />}
    </TouchableOpacity>
  ), [value, handleSelect]);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.trigger}
        onPress={open}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder ?? 'Select'}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>{selected?.label ?? placeholder ?? 'Select...'}</Text>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
          <View style={styles.dropdown}>
            <FlatList data={options} keyExtractor={(item) => item.value} renderItem={renderItem} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { fontFamily: fontFamilySemiBold, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.sm },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 13 },
  triggerText: { fontFamily, fontSize: 16, color: colors.textPrimary, flex: 1 },
  placeholder: { color: colors.textMuted },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', padding: spacing.xl },
  dropdown: { backgroundColor: colors.surface, borderRadius: radius.xl, maxHeight: 320, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
  optionActive: { backgroundColor: colors.primaryLight },
  optionText: { fontFamily, fontSize: 16, color: colors.textPrimary },
  optionTextActive: { fontFamily: fontFamilySemiBold, color: colors.primary },
});
