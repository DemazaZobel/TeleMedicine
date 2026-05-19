import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
  loading?: boolean;
}

export const GoogleSignInButton = ({ onPress, loading }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      disabled={loading}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="logo-google" size={20} color="#4285F4" />
      </View>

      <Text style={styles.text}>
        {loading ? 'Please wait...' : 'Continue with Google'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#4285F4',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
    backgroundColor: 'rgba(66,133,244,0.08)',
  },
  iconWrap: {
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4285F4',
  },
});