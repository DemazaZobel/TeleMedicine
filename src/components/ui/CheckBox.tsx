import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export const Checkbox = ({ checked, onChange, label }: Props) => {
  return (
    <Pressable onPress={onChange} style={styles.container}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Ionicons name="checkmark" size={14} color="#fff" />
        )}
      </View>

      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
});