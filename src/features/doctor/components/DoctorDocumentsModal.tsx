import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Alert, Platform, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Card } from '../../../components/ui';
import { ModalBase } from '../../../components/ui/ModalBase';
import { useTheme, Theme } from '../../../theme';
import { useDoctorStore } from '../../../store/doctor.store';

interface DoctorDocumentsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DoctorDocumentsModal({ visible, onClose }: DoctorDocumentsModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { documents, isUploadingDocument, error, uploadDocument, fetchDocuments, clearError } = useDoctorStore();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    file?: File;
  } | null>(null);
  
  const [documentType, setDocumentType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchDocuments();
      setIsUploading(false);
      setSelectedFile(null);
      setDocumentType('');
      setLicenseNumber('');
      setSuccess(false);
      clearError();
    }
  }, [visible, fetchDocuments, clearError]);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          Alert.alert('Security Warning', 'Documents must be less than 5MB.');
          return;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'] as string[];
        const detectedType = asset.mimeType ?? 'application/octet-stream';
        const isAllowedExtension = asset.name.toLowerCase().match(/\.(pdf|jpeg|jpg|png)$/);

        if (!allowedTypes.includes(detectedType) && !isAllowedExtension) {
          Alert.alert('Invalid Format', 'Only PDF, JPEG, and PNG files are accepted.');
          return;
        }

        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: detectedType,
          file: (asset as any).file,
        });
        clearError();
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document.');
    }
  }, [clearError]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !documentType.trim() || !licenseNumber.trim()) return;

    try {
      const formData = new FormData();
      formData.append('document_type', documentType.trim());
      formData.append('license_number', licenseNumber.trim());
      
      if (Platform.OS === 'web') {
        let fileToUpload = selectedFile.file;
        if (!fileToUpload) {
          const response = await fetch(selectedFile.uri);
          fileToUpload = (await response.blob()) as File;
        }
        formData.append('file', fileToUpload, selectedFile.name);
      } else {
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType,
        } as any);
      }

      await uploadDocument(formData);
      setSuccess(true);
      setTimeout(() => {
        setIsUploading(false);
        setSuccess(false);
        setSelectedFile(null);
        setDocumentType('');
        setLicenseNumber('');
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [selectedFile, documentType, licenseNumber, uploadDocument]);

  const renderStatus = (status: string) => {
    const color = status === 'APPROVED' ? theme.colors.success : status === 'REJECTED' ? theme.colors.error : theme.colors.warning;
    return (
      <View style={[styles.statusTag, { backgroundColor: color + '15' }]}>
        <Text style={[styles.statusTextTag, { color }]}>{status}</Text>
      </View>
    );
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title={isUploading ? "Upload Credentials" : "My Documents"}
      subtitle={isUploading ? "Provide medical documentation for review." : "Track your verification status."}
    >
      <View style={styles.container}>
        {isUploading ? (
          <>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>Document uploaded successfully!</Text>
              </View>
            )}

            <Card style={styles.card}>
              <Input
                label="Document Type"
                placeholder="e.g. Medical License"
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
                style={[styles.uploadArea, selectedFile && styles.uploadAreaActive]}
              >
                <Ionicons 
                  name="cloud-upload-outline" 
                  size={40} 
                  color={selectedFile ? theme.colors.primary : theme.colors.textTertiary} 
                  style={{ marginBottom: 8 }} 
                />
                <Text style={[styles.uploadText, selectedFile && { color: theme.colors.primary, fontWeight: '600' }]}>
                  {selectedFile ? 'Change Selected File' : 'Tap to Select File'}
                </Text>
              </Pressable>

              {selectedFile && (
                <View style={styles.fileInfo}>
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                </View>
              )}
            </Card>

            <View style={{ gap: 12 }}>
              <Button
                title="Submit for Verification"
                onPress={handleUpload}
                loading={isUploadingDocument}
                disabled={!selectedFile || !documentType.trim() || !licenseNumber.trim()}
              />
              <Button
                title="Back to List"
                variant="ghost"
                onPress={() => { setIsUploading(false); clearError(); }}
              />
            </View>
          </>
        ) : (
          <>
            {documents.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTitle}>No documents yet</Text>
                <Text style={styles.emptySubtitle}>Upload your credentials to start verification.</Text>
                <Button 
                  title="Upload Now" 
                  onPress={() => setIsUploading(true)} 
                  style={{ marginTop: 24, paddingHorizontal: 32 }}
                />
              </View>
            ) : (
              <View>
                {documents.map((doc) => (
                  <Card key={doc.id} style={styles.docItem}>
                    <View style={styles.docHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.docName}>{doc.document_type}</Text>
                        <Text style={styles.docRef}>Ref: {doc.license_number}</Text>
                      </View>
                      {renderStatus(doc.status)}
                    </View>
                  </Card>
                ))}
                <Button 
                  title="Upload Another Document" 
                  variant="outline"
                  onPress={() => setIsUploading(true)} 
                  style={{ marginTop: 12 }}
                />
              </View>
            )}
          </>
        )}
      </View>
    </ModalBase>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: theme.spacing.xl,
    },
    card: {
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    uploadArea: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    uploadAreaActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '10',
    },
    uploadText: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
    },
    uploadHint: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 4,
    },
    fileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight + '20',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      gap: 8,
    },
    fileName: {
      ...theme.typography.bodySm,
      color: theme.colors.primary,
      flex: 1,
    },
    submitButton: {
      marginTop: theme.spacing.sm,
    },
    errorBanner: {
      backgroundColor: theme.colors.errorLight,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
    },
    successBanner: {
      backgroundColor: theme.colors.successLight,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    successText: {
      color: theme.colors.success,
      fontWeight: '500',
      fontSize: 14,
      textAlign: 'center',
    },
    // List styles
    docItem: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    docHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    docName: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '600',
    },
    docRef: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    statusTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusTextTag: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginTop: 16,
    },
    emptySubtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
  });
