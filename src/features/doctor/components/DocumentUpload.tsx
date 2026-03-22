import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenContainer, Input, Button } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useDoctorStore } from '../../../store/doctor.store';
import { createDocumentUploadStyles } from '../styles/documentUpload.styles';

export function DocumentUpload() {
  const { theme } = useTheme();
  const styles = useMemo(() => createDocumentUploadStyles(theme), [theme]);

  const { isUploadingDocument, error, uploadDocument, clearError } = useDoctorStore();

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
  } | null>(null);
  
  const [documentType, setDocumentType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'], // Stricter MIME types
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        // Security Check: File Size Limit (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          Alert.alert('Security Warning', 'For security and performance, documents must be less than 5MB.');
          return;
        }

        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
        });
        clearError();
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document securely.');
    }
  }, [clearError]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !documentType.trim() || !licenseNumber.trim()) return;

    try {
      const formData = new FormData();
      formData.append('document_type', documentType.trim());
      formData.append('license_number', licenseNumber.trim());
      
      // React Native trick to append files to FormData
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType,
      } as any);

      await uploadDocument(formData);

      // Reset form after successful upload
      setSelectedFile(null);
      setDocumentType('');
      setLicenseNumber('');

      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch {
      // Error is set in the store
    }
  }, [selectedFile, documentType, licenseNumber, uploadDocument]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Upload Document</Text>
        <Text style={styles.subtitle}>
          Upload your medical credentials for approval
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

        <Input
          label="License / Reference Number"
          placeholder="e.g. LRN-123456"
          value={licenseNumber}
          onChangeText={(t) => { setLicenseNumber(t); clearError(); }}
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
          loading={isUploadingDocument}
          fullWidth
          disabled={!selectedFile || !documentType.trim() || !licenseNumber.trim()}
        />
      </View>
    </ScreenContainer>
  );
}
