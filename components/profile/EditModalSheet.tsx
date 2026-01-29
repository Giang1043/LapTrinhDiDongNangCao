import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface EditModalSheetProps {
  visible: boolean;
  title: string;
  label: string;
  value: string;
  placeholder?: string;
  icon: string;
  keyboardType?: any;
  multiline?: boolean;
  isPassword?: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  loading?: boolean;
}

export const EditModalSheet: React.FC<EditModalSheetProps> = ({
  visible,
  title,
  label,
  value: initialValue,
  placeholder,
  icon,
  keyboardType = 'default',
  multiline = false,
  isPassword = false,
  onClose,
  onSave,
  loading = false,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    onSave(value);
    setValue(initialValue);
  };

  const handleClose = () => {
    setValue(initialValue);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.textPrimary}
              />
            </Pressable>

            <Text variant="titleMedium" style={styles.headerTitle}>
              {title}
            </Text>

            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.iconSection}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name={icon as any}
                  size={32}
                  color={Colors.primary}
                />
              </View>
            </View>

            <Text variant="labelSmall" style={styles.labelText}>
              {label}
            </Text>

            <TextInput
              label={label}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              mode="outlined"
              style={styles.input}
              keyboardType={keyboardType}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              secureTextEntry={isPassword}
            />

            {isPassword && (
              <Text variant="labelSmall" style={styles.helperText}>
                Nhập mật khẩu mới của bạn. Hãy sử dụng mật khẩu mạnh.
              </Text>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={handleClose}
              disabled={loading}
              style={styles.cancelBtn}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading || value === initialValue}
              style={styles.saveBtn}
            >
              Lưu
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  helperText: {
    color: Colors.gray500,
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
});
