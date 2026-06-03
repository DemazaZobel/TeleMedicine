// src/components/ui/TranslitGuideModal.tsx
// Reusable guide modal. Import wherever you have a ሀ/A toggle.
// Usage:
//   import { TranslitGuideModal } from './TranslitGuideModal';
//   <TranslitGuideModal visible={guideVisible} onClose={() => setGuideVisible(false)} theme={theme} />

import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  FlatList, Platform,
} from 'react-native';

const GUIDE = [
  {
    section: '📖 How It Works',
    items: [
      { type: 'se',  amharic: 'ሰ',  example: 'Single e = 1st order (natural form)' },
      { type: 'see', amharic: 'ሴ',  example: 'Double ee = 5th order (explicit e)' },
      { type: 'sa',  amharic: 'ሳ',  example: 'a = 3rd order' },
      { type: 'su',  amharic: 'ሱ',  example: 'u = 2nd order' },
      { type: 'si',  amharic: 'ሲ',  example: 'i = 4th order' },
      { type: 'so',  amharic: 'ሶ',  example: 'o = 7th order' },
      { type: 's',   amharic: 'ስ',  example: 'No vowel = 6th order (base form)' },
    ],
  },
  {
    section: '🔤 Special Combinations',
    items: [
      { type: 'sh',    amharic: 'ሸ', example: 'shemane → ሸማኔ' },
      { type: 'ch',    amharic: 'ቸ', example: 'chigir → ችግር' },
      { type: 'gn/ny', amharic: 'ኘ', example: 'gna → ኛ' },
      { type: 'hh',    amharic: 'ሐ', example: 'hhakim → ሐኪም' },
      { type: 'th',    amharic: 'ጠ', example: 'thena → ጠና' },
      { type: 'ts',    amharic: 'ጸ', example: 'tsega → ጸጋ' },
      { type: 'tz',    amharic: 'ፀ', example: 'tzega → ፀጋ (different from ts!)' },
      { type: 'zh',    amharic: 'ዠ', example: 'zhum → ዡም' },
      { type: 'ph',    amharic: 'ጰ', example: 'pha → ጳ' },
    ],
  },
  {
    section: '💬 Common Words',
    items: [
      { type: 'selam',           amharic: 'ሰላም',          example: 'Hello / Peace' },
      { type: 'ishi',            amharic: 'እሺ',            example: 'OK / Sure' },
      { type: 'ameseginalehu',   amharic: 'አመሰግናለሁ',      example: 'Thank you' },
      { type: 'tena yistilign',  amharic: 'ጤና ይስጥልኝ',    example: 'Good health' },
      { type: 'betam konjo',     amharic: 'በጣም ቆንጆ',      example: 'Very beautiful' },
      { type: 'wedije neger',    amharic: 'ወዲጄ ነገር',      example: 'My friend' },
    ],
  },
  {
    section: '🏥 Medical Terms',
    items: [
      { type: 'hkim',    amharic: 'ሕኪም',      example: 'Doctor' },
      { type: 'tena',    amharic: 'ጤና',        example: 'Health' },
      { type: 'hemem',   amharic: 'ህመም',      example: 'Pain / Illness' },
      { type: 'ketero',  amharic: 'ቀጠሮ',      example: 'Appointment' },
      { type: 'medhanie', amharic: 'መድኃኒት',   example: 'Medicine' },
      { type: 'hospital', amharic: 'ሆስፒታል',   example: 'Hospital' },
    ],
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

export function TranslitGuideModal({ visible, onClose, theme }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          maxHeight: '88%', paddingBottom: 32,
        }}>

          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20, borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text }}>
                Amharic Typing Guide
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                Type Latin letters → get Amharic script
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 34, height: 34, borderRadius: 17,
                backgroundColor: theme.colors.border,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: theme.colors.text, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={GUIDE}
            keyExtractor={(item) => item.section}
            contentContainerStyle={{ padding: 16, gap: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: section }) => (
              <View>
                {/* Section title */}
                <View style={{
                  backgroundColor: theme.colors.primary + '15',
                  borderRadius: 8, paddingHorizontal: 12,
                  paddingVertical: 7, marginBottom: 12,
                }}>
                  <Text style={{
                    fontSize: 13, fontWeight: '800',
                    color: theme.colors.primary,
                  }}>
                    {section.section}
                  </Text>
                </View>

                {/* Items */}
                <View style={{ gap: 8 }}>
                  {section.items.map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: theme.colors.surface,
                        borderRadius: 10, padding: 12, gap: 12,
                        borderWidth: 1, borderColor: theme.colors.border,
                      }}
                    >
                      {/* Latin key badge */}
                      <View style={{
                        backgroundColor: theme.colors.primary + '18',
                        borderRadius: 8, paddingHorizontal: 10,
                        paddingVertical: 6, minWidth: 52,
                        alignItems: 'center',
                      }}>
                        <Text style={{
                          fontSize: 13, fontWeight: '800',
                          color: theme.colors.primary,
                          fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                        }}>
                          {item.type}
                        </Text>
                      </View>

                      {/* Arrow */}
                      <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>→</Text>

                      {/* Amharic result */}
                      <Text style={{
                        fontSize: 22, fontWeight: '700',
                        color: theme.colors.text, minWidth: 42,
                      }}>
                        {item.amharic}
                      </Text>

                      {/* Example / description */}
                      <Text style={{
                        flex: 1, fontSize: 11,
                        color: theme.colors.textSecondary,
                        lineHeight: 17,
                      }}>
                        {item.example}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}