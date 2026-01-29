import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface ProfileSectionProps {
  title: string;
  icon: string;
  value?: string;
  isEditable?: boolean;
  onPress?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  icon,
  value,
  isEditable = false,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isEditable && pressed && styles.pressed,
      ]}
      onPress={isEditable ? onPress : undefined}
      disabled={!isEditable}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={Colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text variant="labelSmall" style={styles.label}>
          {title}
        </Text>
        <Text
          variant="bodyMedium"
          style={styles.value}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || 'Chưa cập nhật'}
        </Text>
      </View>

      {isEditable && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={Colors.gray400}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  pressed: {
    backgroundColor: Colors.gray50,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});
