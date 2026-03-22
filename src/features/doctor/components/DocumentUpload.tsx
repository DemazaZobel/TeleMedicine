import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenContainer, Input, Button } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useDoctorStore } from '../../../store/doctorStore';
import { createDocumentUploadStyles } from '../styles/documentUpload.styles';

export function DocumentUpload() {
  const { theme } = useTheme();
  const styles = useMemo(() => createDocumentUploadStyles(theme), [theme]);

  const { isUploading, error, uploadDocument, clearError } = useDoctorStore();

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [documentType, setDocumentType] = useState('');

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
        });
        clearError();
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document.');
    }
  }, [clearError]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !documentType.trim()) return;

    try {
      await uploadDocument({
        file: {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType,
        },
        documentType: documentType.trim(),
      });

      // Reset form after successful upload
      setSelectedFile(null);
      setDocumentType('');

      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch {
      // Error is set in the store
    }
  }, [selectedFile, documentType, uploadDocument]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Upload Document</Text>
        <Text style={styles.subtitle}>
          Upload your credential documents for verification
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          label="Document Type"
          placeholder="e.g. Medical License, Board Certification"
          value={documentType}
          onChangeText={(t) => { setDocumentType(t); clearError(); }}
        />

        <Pressable
          onPress={handlePickFile}
          style={[
            styles.uploadArea,
            selectedFile && styles.uploadAreaActive,
          ]}
        >
          <Text style={styles.uploadIcon}>📎</Text>
          <Text style={styles.uploadText}>
            {selectedFile ? 'Change File' : 'Tap to Select File'}
          </Text>
          <Text style={styles.uploadHint}>PDF or image files accepted</Text>
        </Pressable>

        {selectedFile && (
          <View style={styles.selectedFile}>
            <Text style={styles.fileName}>{selectedFile.name}</Text>
            <Text style={styles.fileType}>{selectedFile.mimeType}</Text>
          </View>
        )}

        <Button
          title="Upload Document"
          onPress={handleUpload}
          loading={isUploading}
          fullWidth
          disabled={!selectedFile || !documentType.trim()}
        />
      </View>
    </ScreenContainer>
  );
}
