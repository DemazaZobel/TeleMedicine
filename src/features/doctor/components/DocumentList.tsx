import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { ScreenContainer, Card, Loader } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useDoctorStore } from '../../../store/doctorStore';
import { createDocumentListStyles } from '../styles/documentList.styles';
import type { ProviderDocument, DocumentStatus } from '../types';
import { formatDate } from '../../../utils';

const STATUS_MAP: Record<DocumentStatus, { style: string; textStyle: string; label: string }> = {
  PENDING: { style: 'statusPending', textStyle: 'statusPendingText', label: 'Pending' },
  APPROVED: { style: 'statusApproved', textStyle: 'statusApprovedText', label: 'Approved' },
  REJECTED: { style: 'statusRejected', textStyle: 'statusRejectedText', label: 'Rejected' },
};

export function DocumentList() {
  const { theme } = useTheme();
  const styles = useMemo(() => createDocumentListStyles(theme), [theme]);

  const { documents, isLoading, fetchDocuments } = useDoctorStore();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const renderStatusBadge = useCallback(
    (status: DocumentStatus) => {
      const config = STATUS_MAP[status];
      return (
        <View
          style={[
            styles.statusBadge,
            styles[config.style as keyof typeof styles] as any,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              styles[config.textStyle as keyof typeof styles] as any,
            ]}
          >
            {config.label}
          </Text>
        </View>
      );
    },
    [styles]
  );

  const renderDocument = useCallback(
    ({ item }: { item: ProviderDocument }) => (
      <Card style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.name}
          </Text>
          {renderStatusBadge(item.status)}
        </View>
        <Text style={styles.documentType}>{item.documentType}</Text>
        <Text style={styles.documentDate}>
          Uploaded {formatDate(item.uploadedAt)}
        </Text>
        {item.reviewNotes && (
          <Text style={styles.reviewNotes}>Note: {item.reviewNotes}</Text>
        )}
      </Card>
    ),
    [styles, renderStatusBadge]
  );

  if (isLoading && documents.length === 0) {
    return <Loader message="Loading documents..." />;
  }

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.title}>My Documents</Text>
          <Text style={styles.subtitle}>
            Track the status of your uploaded credentials
          </Text>
        </View>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No documents uploaded</Text>
            <Text style={styles.emptySubtitle}>
              Upload your credentials to get verified
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderDocument}
            contentContainerStyle={{ padding: 16, gap: 0 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}
