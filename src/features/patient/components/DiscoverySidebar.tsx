import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../i18n';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation } from 'react-native';
import { Input, StarRating } from '../../../components/ui';
import { Theme, useTheme } from '../../../theme';
import { useDiscoveryStore } from '../../../store/discovery.store';

const PRICE_RANGES = [
  { label: 'Any Price', min: null, max: null },
  { label: 'Under Br 500', min: 0, max: 500 },
  { label: 'Br 500 - 1000', min: 500, max: 1000 },
  { label: 'Above Br 1000', min: 1000, max: null },
];



const SORT_OPTIONS: { label: string; value: 'fee' | 'fee_desc' | 'rating' | 'rating_desc' | 'distance' | 'experience_desc' | null }[] = [
  { label: 'Most Experienced', value: 'experience_desc' },
  { label: 'Highest Rated', value: 'rating_desc' },
  { label: 'Lowest Rated', value: 'rating' },
  { label: 'Lowest Fee', value: 'fee' },
  { label: 'Highest Fee', value: 'fee_desc' },
  { label: 'Nearest to Me', value: 'distance' },
];

interface DiscoverySidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function DiscoverySidebar({ isCollapsed, onToggle }: DiscoverySidebarProps) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark, isCollapsed), [theme, isDark, isCollapsed]);
  
  const { 
    minFee, maxFee, minRating, location, hospital, availability, selectedSpecialization, specializations, sortBy,
    setAdvancedFilters, setSelectedSpecialization, clearFilters
  } = useDiscoveryStore();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getPriceLabel = () => {
    const range = PRICE_RANGES.find(r => r.min === minFee && r.max === maxFee);
    return range?.label || 'Any Price';
  };

  const getSortLabel = () => {
    const sort = SORT_OPTIONS.find(s => s.value === sortBy);
    return sort?.label || t('patient:recommendedRating');
  };

  if (isCollapsed) {
    return (
      <View style={styles.collapsedContainer}>
        <TouchableOpacity style={styles.toggleBtn} onPress={onToggle}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 24, paddingTop: 20 }}>
          <TouchableOpacity onPress={() => { onToggle?.(); setExpandedSection('sort'); }}>
            <Ionicons name="swap-vertical" size={22} color={sortBy ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onToggle?.(); setExpandedSection('spec'); }}>
            <Ionicons name="medkit-outline" size={22} color={selectedSpecialization ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onToggle?.(); setExpandedSection('location'); }}>
            <Ionicons name="location-outline" size={22} color={location ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onToggle?.(); setExpandedSection('price'); }}>
            <Ionicons name="cash-outline" size={22} color={minFee ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onToggle?.(); setExpandedSection('rating'); }}>
            <Ionicons name="star-outline" size={22} color={minRating ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onToggle?.(); setExpandedSection('calendar'); }}>
            <Ionicons name="calendar-outline" size={22} color={availability !== 'any' ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={onToggle} style={styles.headerToggle}>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("patient:filters")}</Text>
        </View>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearText}>{t("common:reset")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Sort By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("patient:sortBy")}</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger} 
            onPress={() => toggleSection('sort')}
          >
            <Text style={[styles.dropdownValue, !sortBy && { color: theme.colors.textTertiary }]}>
              {getSortLabel()}
            </Text>
            <Ionicons 
              name={expandedSection === 'sort' ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>

          {expandedSection === 'sort' && (
            <View style={styles.dropdownContent}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  setAdvancedFilters({ sortBy: null });
                  setExpandedSection(null);
                }}
              >
                <Text style={styles.dropdownItemText}>{t("patient:recommendedRating")}</Text>
              </TouchableOpacity>
              {SORT_OPTIONS.map((sort) => (
                <TouchableOpacity 
                  key={sort.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setAdvancedFilters({ sortBy: sort.value });
                    setExpandedSection(null);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{sort.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Specialization Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialization</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger} 
            onPress={() => toggleSection('spec')}
          >
            <Text style={[styles.dropdownValue, !selectedSpecialization && { color: theme.colors.textTertiary }]}>
              {selectedSpecialization || 'All Specialties'}
            </Text>
            <Ionicons 
              name={expandedSection === 'spec' ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>

          {expandedSection === 'spec' && (
            <View style={styles.dropdownContent}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedSpecialization(null);
                  setExpandedSection(null);
                }}
              >
                <Text style={styles.dropdownItemText}>All Specialties</Text>
              </TouchableOpacity>
              {(Array.isArray(specializations) ? specializations : []).map((spec) => (
                <TouchableOpacity 
                  key={spec}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSpecialization(spec);
                    setExpandedSection(null);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{spec}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Location & Facility Redesign - Simpler and Spaced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("appointment:locationFacility")}</Text>
          <Input
            placeholder={t("common:cityRegion")}
            value={location || ''}
            onChangeText={(val) => setAdvancedFilters({ location: val || null })}
            leftIcon={<Ionicons name="location-outline" size={16} color={theme.colors.primary} />}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
          />
          <View style={{ height: 12 }} />
          <Input
            placeholder={t("doctor:hospitalName")}
            value={hospital || ''}
            onChangeText={(val) => setAdvancedFilters({ hospital: val || null })}
            leftIcon={<Ionicons name="business-outline" size={16} color={theme.colors.primary} />}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
          />
        </View>

        {/* Price Dropdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("doctor:consultationFeeLabel")}</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger} 
            onPress={() => toggleSection('price')}
          >
            <Text style={[styles.dropdownValue, !minFee && !maxFee && { color: theme.colors.textTertiary }]}>
              {getPriceLabel()}
            </Text>
            <Ionicons 
              name={expandedSection === 'price' ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>

          {expandedSection === 'price' && (
            <View style={styles.dropdownContent}>
              {PRICE_RANGES.map((range) => (
                <TouchableOpacity 
                  key={range.label}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setAdvancedFilters({ minFee: range.min, maxFee: range.max });
                    setExpandedSection(null);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{range.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Rating Dropdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("patient:minimumRating")}</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger} 
            onPress={() => toggleSection('rating')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {minRating ? (
                <>
                  <StarRating rating={minRating} size={12} showEmpty={false} />
                  <Text style={[styles.dropdownValue, { marginLeft: 8 }]}>{minRating}+ Stars</Text>
                </>
              ) : (
                <Text style={[styles.dropdownValue, { color: theme.colors.textTertiary }]}>{t("patient:selectMinRating")}</Text>
              )}
            </View>
            <Ionicons 
              name={expandedSection === 'rating' ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>

          {expandedSection === 'rating' && (
            <View style={styles.dropdownContent}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  setAdvancedFilters({ minRating: null });
                  setExpandedSection(null);
                }}
              >
                <Text style={styles.dropdownItemText}>{t("patient:anyRating")}</Text>
              </TouchableOpacity>
              {[3, 4, 4.5].map((rating) => (
                <TouchableOpacity 
                  key={rating}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setAdvancedFilters({ minRating: rating });
                    setExpandedSection(null);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <StarRating rating={rating} size={12} showEmpty={false} />
                    <Text style={[styles.dropdownItemText, { marginLeft: 8 }]}>{rating}+ Stars</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Availability Calendar Redesign */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <TouchableOpacity 
            style={styles.calendarTrigger}
            onPress={() => toggleSection('calendar')}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.calendarValue}>
              {availability === 'any' ? 'Select Date Range' : availability === 'today' ? t('common:today') : 'Next 7 Days'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
          
          {expandedSection === 'calendar' && (
            <View style={styles.calendarDropdown}>
               <TouchableOpacity 
                style={[styles.dateOption, availability === 'any' && styles.dateOptionActive]}
                onPress={() => {
                  setAdvancedFilters({ availability: 'any' });
                  setExpandedSection(null);
                }}
              >
                <Text style={[styles.dateOptionText, availability === 'any' && styles.dateOptionTextActive]}>{t("patient:anyTime")}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateOption, availability === 'today' && styles.dateOptionActive]}
                onPress={() => {
                  setAdvancedFilters({ availability: 'today' });
                  setExpandedSection(null);
                }}
              >
                <Text style={[styles.dateOptionText, availability === 'today' && styles.dateOptionTextActive]}>{t("common:today")}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateOption, availability === 'this-week' && styles.dateOptionActive]}
                onPress={() => {
                  setAdvancedFilters({ availability: 'this-week' });
                  setExpandedSection(null);
                }}
              >
                <Text style={[styles.dateOptionText, availability === 'this-week' && styles.dateOptionTextActive]}>{t("common:thisWeek")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme, isDark: boolean, isCollapsed?: boolean) =>
  StyleSheet.create({
    container: {
      width: 280,
      backgroundColor: isDark ? theme.colors.surfaceElevated : '#fff',
      borderRadius: 24,
      marginRight: 20,
      marginTop: 8,
      alignSelf: 'flex-start',
      ...theme.shadows.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme.colors.border,
      maxHeight: '90%',
    },
    collapsedContainer: {
      width: 60,
      backgroundColor: isDark ? theme.colors.surfaceElevated : '#fff',
      borderRadius: 24,
      marginRight: 12,
      marginTop: 8,
      alignSelf: 'flex-start',
      ...theme.shadows.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme.colors.border,
      paddingVertical: 16,
    },
    toggleBtn: {
      alignItems: 'center',
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerToggle: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    clearText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    dropdownTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dropdownValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '600',
    },
    dropdownContent: {
      marginTop: 6,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    inputGroup: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 12,
    },
    inputDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: 40,
    },
    groupInputContainer: {
      flex: 1,
      marginBottom: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    inputContainer: {
      marginBottom: 0,
    },
    input: {
      fontSize: 13,
      fontWeight: '500',
    },
    calendarTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    calendarValue: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '600',
    },
    calendarDropdown: {
      marginTop: 6,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 8,
      gap: 4,
    },
    dateOption: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    dateOptionActive: {
      backgroundColor: theme.colors.primary + '10',
    },
    dateOptionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    dateOptionTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });
