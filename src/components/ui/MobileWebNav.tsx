import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from '../../theme';
import { Navbar } from './Navbar';

interface MobileWebNavProps {
  onNotificationsPress?: () => void;
}

export function MobileWebNav({ onNotificationsPress }: MobileWebNavProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onNotificationsPress} style={styles.menuButton}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>
          <View style={styles.drawer}>
            <Navbar 
              onNavigate={() => setIsOpen(false)} 
              onNotificationsPress={() => {
                setIsOpen(false);
                onNotificationsPress?.();
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 50,
  },
  logoImage: {
    width: 120,
    height: 36,
  },
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: 260,
    height: '100%',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});
