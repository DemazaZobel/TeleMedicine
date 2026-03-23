import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { ScreenContainer, Card, Loader } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useDoctorStore } from '../../../store/doctor.store';
import { createDocumentListStyles } from '../styles/documentList.styles';
import type { DoctorDocument, DocumentStatus } from '../types/doctor.types';
import { formatDate } from '../../../utils';

const STATUS_MAP: Record<DocumentStatus, { style: string; textStyle: string; label: string }> = {
  PENDING: { style: 'statusPending', textStyle: 'statusPendingText', label: 'Pending' },
  APPROVED: { style: 'statusApproved', textStyle: 'statusApprovedText', label: 'Approved' },
  REJECTED: { style: 'statusRejected', textStyle: 'statusRejectedText', label: 'Rejected' },
};

export function DocumentList({ header }: { header?: React.ReactNode }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createDocumentListStyles(theme), [theme]);

  const { documents, isLoadingProfile, fetchDocuments } = useDoctorStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
    ({ item }: { item: DoctorDocument }) => (
      <Card style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.document_type}
          </Text>
          {renderStatusBadge(item.status)}
        </View>
        <Text style={styles.documentType}>No: {item.license_number}</Text>
        <Text style={styles.documentDate}>
          Uploaded {formatDate(item.uploaded_at)}
        </Text>
      </Card>
    ),
    [styles, renderStatusBadge]
  );

  if (isLoadingProfile && documents.length === 0) {
    return <Loader message="Loading documents..." />;
  }

  const HeaderComponent = (
    <>
      {header}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.title}>My Documents</Text>
        <Text style={styles.subtitle}>
          Track the status of your uploaded credentials
        </Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>

        {documents.length === 0 ? (
          <>
            {HeaderComponent}
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyTitle}>No documents uploaded</Text>
              <Text style={styles.emptySubtitle}>
                Upload your credentials to get verified
              </Text>
            </View>
          </>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderDocument}
            ListHeaderComponent={HeaderComponent}
            contentContainerStyle={{ padding: 16, gap: 0 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingProfile}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
    </View>
  );
}
