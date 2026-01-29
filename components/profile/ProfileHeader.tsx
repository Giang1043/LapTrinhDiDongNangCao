import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  avatar?: string;
  onEditAvatar?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  fullName,
  email,
  avatar,
  onEditAvatar,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={120}
          source={{
            uri: avatar || 'https://via.placeholder.com/120',
          }}
        />
        <Pressable style={styles.editAvatarBtn} onPress={onEditAvatar}>
          <MaterialCommunityIcons
            name="camera-plus"
            size={20}
            color={Colors.white}
          />
        </Pressable>
      </View>

      <View style={styles.infoContainer}>
        <Text variant="headlineMedium" style={styles.name}>
          {fullName}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {email}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    color: Colors.textSecondary,
  },
});
