import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface ChangePasswordSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (oldPassword: string, newPassword: string, confirmPassword: string) => void;
  loading?: boolean;
}

export const ChangePasswordSheet: React.FC<ChangePasswordSheetProps> = ({
  visible,
  onClose,
  onSave,
  loading = false,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid =
    oldPassword.trim() &&
    newPassword.trim() &&
    confirmPassword.trim() &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  const handleSave = () => {
    onSave(oldPassword, newPassword, confirmPassword);
    handleClose();
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
              Đổi mật khẩu
            </Text>

            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.iconSection}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={32}
                  color={Colors.primary}
                />
              </View>
            </View>

            <Text variant="bodySmall" style={styles.description}>
              Nhập mật khẩu hiện tại của bạn, sau đó nhập mật khẩu mới.
            </Text>

            {/* Old Password */}
            <Text variant="labelSmall" style={styles.labelText}>
              Mật khẩu hiện tại
            </Text>
            <TextInput
              label="Mật khẩu hiện tại"
              value={oldPassword}
              onChangeText={setOldPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showOldPassword}
              right={
                <TextInput.Icon
                  icon={showOldPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowOldPassword(!showOldPassword)}
                />
              }
            />

            {/* New Password */}
            <Text variant="labelSmall" style={styles.labelText}>
              Mật khẩu mới
            </Text>
            <TextInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showNewPassword}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
            />

            {/* Confirm Password */}
            <Text variant="labelSmall" style={styles.labelText}>
              Xác nhận mật khẩu
            </Text>
            <TextInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            {/* Validation Messages */}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color={Colors.error}
                />
                <Text variant="labelSmall" style={styles.errorText}>
                  Mật khẩu không khớp
                </Text>
              </View>
            )}

            {newPassword && newPassword.length < 6 && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color={Colors.error}
                />
                <Text variant="labelSmall" style={styles.errorText}>
                  Mật khẩu phải có ít nhất 6 ký tự
                </Text>
              </View>
            )}

            <View style={styles.requirementsContainer}>
              <Text variant="labelSmall" style={styles.requirementTitle}>
                Yêu cầu mật khẩu:
              </Text>
              <View style={styles.requirement}>
                <MaterialCommunityIcons
                  name={newPassword.length >= 6 ? 'check-circle' : 'circle-outline'}
                  size={14}
                  color={newPassword.length >= 6 ? Colors.success : Colors.gray400}
                />
                <Text
                  variant="labelSmall"
                  style={[
                    styles.requirementText,
                    newPassword.length >= 6 && styles.requirementMet,
                  ]}
                >
                  Ít nhất 6 ký tự
                </Text>
              </View>
            </View>
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
              disabled={loading || !isFormValid}
              style={styles.saveBtn}
            >
              Cập nhật
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
    maxHeight: '95%',
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
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  labelText: {
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: Colors.error,
    flex: 1,
  },
  requirementsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    marginTop: 16,
  },
  requirementTitle: {
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  requirementText: {
    color: Colors.textSecondary,
  },
  requirementMet: {
    color: Colors.success,
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
