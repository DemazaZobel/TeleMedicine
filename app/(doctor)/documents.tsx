import { View } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { DocumentUpload, DocumentList } from '../../src/features/doctor';
import { useTheme } from '../../src/theme';

export default function DocumentsRoute() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <DocumentList 
        header={
          <>
            <DocumentUpload />
            <View style={{ height: 1, backgroundColor: theme.colors.divider, marginVertical: 32 }} />
          </>
        } 
      />
    </ScreenContainer>
  );
}
