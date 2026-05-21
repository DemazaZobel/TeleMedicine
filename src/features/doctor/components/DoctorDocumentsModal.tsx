import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Card, Input } from "../../../components/ui";
import { ModalBase } from "../../../components/ui/ModalBase";
import { useDoctorStore } from "../../../store/doctor.store";
import { Theme, useTheme } from "../../../theme";

interface DoctorDocumentsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DoctorDocumentsModal({
  visible,
  onClose,
}: DoctorDocumentsModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    documents,
    isUploadingDocument,
    error,
    uploadDocument,
    fetchDocuments,
    clearError,
  } = useDoctorStore();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    file?: File;
  } | null>(null);

  const [documentType, setDocumentType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchDocuments();
      setIsUploading(false);
      setSelectedFile(null);
      setDocumentType("");
      setLicenseNumber("");
      setSuccess(false);
      clearError();
    }
  }, [visible, fetchDocuments, clearError]);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          Alert.alert("Security Warning", "Documents must be less than 5MB.");
          return;
        }

        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
        ] as string[];
        const detectedType = asset.mimeType ?? "application/octet-stream";
        const isAllowedExtension = asset.name
          .toLowerCase()
          .match(/\.(pdf|jpeg|jpg|png)$/);

        if (!allowedTypes.includes(detectedType) && !isAllowedExtension) {
          Alert.alert(
            "Invalid Format",
            "Only PDF, JPEG, and PNG files are accepted.",
          );
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
      Alert.alert("Error", "Failed to pick document.");
    }
  }, [clearError]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !documentType.trim() || !licenseNumber.trim()) return;

    if (documentType.length > 100) {
      Alert.alert(
        "Validation Error",
        "Credential type is too long (max 100 chars).",
      );
      return;
    }
    if (licenseNumber.length > 50) {
      Alert.alert(
        "Validation Error",
        "License number is too long (max 50 chars).",
      );
      return;
    }

    // Check for duplicate license number in already uploaded documents
    const duplicateLicense = documents.find(
      (doc) =>
        doc.license_number.toLowerCase() === licenseNumber.trim().toLowerCase() &&
        doc.document_type.toLowerCase() === documentType.trim().toLowerCase(),
    );

    if (duplicateLicense) {
      if (duplicateLicense.status === "APPROVED") {
        Alert.alert(
          "Duplicate Record",
          "This credential has already been verified for your profile.",
        );
        return;
      } else if (duplicateLicense.status === "PENDING") {
        Alert.alert(
          "Duplicate Pending",
          "This credential is already under review. You don't need to upload it again.",
        );
        return;
      }
    }

    // Check for duplicate file names
    const duplicateFile = documents.find(
      (doc) =>
        doc.file.split("/").pop()?.toLowerCase() ===
        selectedFile.name.toLowerCase(),
    );

    if (duplicateFile) {
      Alert.alert(
        "File Already Exists",
        "A file with this name has already been uploaded. Please use a unique filename if this is a different document.",
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("document_type", documentType.trim());
      formData.append("license_number", licenseNumber.trim());

      if (Platform.OS === "web") {
        let fileToUpload = selectedFile.file;
        if (!fileToUpload) {
          const response = await fetch(selectedFile.uri);
          fileToUpload = (await response.blob()) as File;
        }
        formData.append("file", fileToUpload, selectedFile.name);
      } else {
        formData.append("file", {
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
        setDocumentType("");
        setLicenseNumber("");
      }, 1500);
    } catch {
      // Error is set in the store
    }
  }, [selectedFile, documentType, licenseNumber, uploadDocument]);

  const renderStatus = (status: string) => {
    const color =
      status === "APPROVED"
        ? theme.colors.success
        : status === "REJECTED"
          ? theme.colors.error
          : theme.colors.warning;
    return (
      <View style={[styles.statusTag, { backgroundColor: color + "15" }]}>
        <Text style={[styles.statusTextTag, { color }]}>{status}</Text>
      </View>
    );
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title={isUploading ? "Upload Credentials" : "My Documents"}
      subtitle={
        isUploading
          ? "Provide medical documentation for review."
          : "Track your verification status."
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {isUploading ? (
          <>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>
                  Credential uploaded successfully!
                </Text>
              </View>
            )}

            <Card style={styles.card}>
              <Input
                label="Credential Type"
                placeholder="e.g. Medical License"
                value={documentType}
                onChangeText={(t) => {
                  setDocumentType(t);
                  clearError();
                }}
                maxLength={100}
              />

              <Input
                label="License Number / ID"
                placeholder="e.g. LRN-123456"
                value={licenseNumber}
                onChangeText={(t) => {
                  setLicenseNumber(t);
                  clearError();
                }}
                maxLength={50}
              />

              <Pressable
                onPress={handlePickFile}
                style={[
                  styles.uploadArea,
                  selectedFile && styles.uploadAreaActive,
                ]}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={40}
                  color={
                    selectedFile
                      ? theme.colors.primary
                      : theme.colors.textTertiary
                  }
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={[
                    styles.uploadText,
                    selectedFile && {
                      color: theme.colors.primary,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {selectedFile ? "Change Selected File" : "Tap to Select File"}
                </Text>
                <Text style={styles.uploadHint}>
                  Accepted: PDF, JPEG, PNG (Max 5MB)
                </Text>
              </Pressable>

              {selectedFile && (
                <View style={styles.fileInfo}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
              )}
            </Card>

            <View style={{ gap: 12, marginBottom: 24 }}>
              <Button
                title="Submit for Verification"
                onPress={handleUpload}
                loading={isUploadingDocument}
                disabled={
                  !selectedFile || !documentType.trim() || !licenseNumber.trim()
                }
              />
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setIsUploading(false);
                  clearError();
                }}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>My Credentials</Text>
              <Button
                title="Add New"
                size="sm"
                variant="outline"
                onPress={() => setIsUploading(true)}
                icon={
                  <Ionicons name="add" size={16} color={theme.colors.primary} />
                }
              />
            </View>

            {documents.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={64}
                  color={theme.colors.textTertiary}
                />
                <Text style={styles.emptyTitle}>No credentials yet</Text>
                <Text style={styles.emptySubtitle}>
                  Upload your medical license and certificates to get verified.
                </Text>
              </View>
            ) : (
              <View>
                {documents.map((doc) => (
                  <Card key={doc.id} style={styles.docItem}>
                    <View style={styles.docHeader}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.docName}>{doc.document_type}</Text>
                        <Text style={styles.docRef}>
                          ID: {doc.license_number}
                        </Text>
                        <Text style={styles.docDate}>
                          Uploaded on{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </Text>
                      </View>
                      {renderStatus(doc.status)}
                    </View>
                    {doc.status === 'REJECTED' && doc.rejection_reason && (
                      <View style={{ marginTop: 8, padding: 8, backgroundColor: theme.colors.error + '10', borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, color: theme.colors.error }}>
                          <Text style={{ fontWeight: '600' }}>Reason:</Text> {doc.rejection_reason}
                        </Text>
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
      borderStyle: "dashed",
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    uploadAreaActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + "10",
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
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primaryLight + "20",
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
      fontWeight: "500",
      fontSize: 14,
      textAlign: "center",
    },
    // List styles
    docItem: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    docHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    docName: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: "600",
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
      fontWeight: "700",
      textTransform: "uppercase",
    },
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      fontWeight: "700",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginTop: 16,
    },
    emptySubtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
    },
    docDate: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
  });
