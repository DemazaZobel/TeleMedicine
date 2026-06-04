import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { PageHeader, ScreenContainer } from '../../src/components/ui';
import { useTranslation } from '../../src/i18n';
import { useBookingStore } from '../../src/store/booking.store';
import { useTheme } from '../../src/theme';

type Theme = any;

function toNumber(val: any, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export default function WalletScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation('wallet');
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;

  const styles = createStyles(theme, isWide);

  const {
    wallet,
    payoutMethod,
    withdrawals,
    fetchWallet,
    fetchPayoutMethod,
    fetchWithdrawals,
    savePayoutMethod,
    createWithdrawal,
    isLoading,
  } = useBookingStore();

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);

  const [uiError, setUiError] = useState<string | null>(null);
  const [uiSuccess, setUiSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    payout_channel: 'TELEBIRR',
    account_name: '',
    account_number: '',
    bank_name: 'TELEBIRR',
  });

  useEffect(() => {
    fetchWallet();
    fetchPayoutMethod();
    fetchWithdrawals();
  }, []);

  const totalEarned = toNumber(wallet?.total_earned);
  const totalWithdrawn = toNumber(wallet?.total_withdrawn);
  const available = totalEarned - totalWithdrawn;
  const isInvalidAmount = isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || parseFloat(amount) > available;

  const refreshAll = () => {
    fetchWallet();
    fetchPayoutMethod();
    fetchWithdrawals();
  };

  const openEditModal = () => {
    if (payoutMethod) {
      setForm({
        payout_channel: payoutMethod.payout_channel || 'TELEBIRR',
        account_name: payoutMethod.account_name || '',
        account_number: payoutMethod.account_number || '',
        bank_name: payoutMethod.bank_name || 'TELEBIRR',
      });
    } else {
      setForm({
        payout_channel: 'TELEBIRR',
        account_name: '',
        account_number: '',
        bank_name: 'TELEBIRR',
      });
    }
    setPayoutModalVisible(true);
  };

  const handleWithdraw = async () => {
    setUiError(null);
    setUiSuccess(null);
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      setUiError(t('wallet.withdraw.errors.invalidAmount'));
      return;
    }

    if (!payoutMethod) {
      setUiError(t('wallet.withdraw.errors.noPayoutMethod'));
      return;
    }

    if (value > available) {
      setUiError(t('wallet.withdraw.errors.insufficientFunds', { amount: available.toFixed(2) }));
      return;
    }

    const MIN_WITHDRAWAL = 50;
    if (value < MIN_WITHDRAWAL) {
      setUiError(t('wallet.withdraw.errors.minimumAmount', { amount: MIN_WITHDRAWAL }));
      return;
    }

    setSubmitting(true);
    try {
      await createWithdrawal({
        amount: value,
        payout_method_id: payoutMethod.id,
      });

      setAmount('');
      refreshAll();
      setUiSuccess(t('wallet.withdraw.success'));
    } catch (error) {
      console.error(error);
      setUiError(t('wallet.withdraw.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePayout = async () => {
    if (!form.account_name || !form.account_number || !form.bank_name) return;

    await savePayoutMethod(form);
    setPayoutModalVisible(false);
    refreshAll();
  };

  return (
    <ScreenContainer scrollable={false} padded constrained>
      <PageHeader title={t('wallet.title')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshAll} />
        }
      >
        {/* HERO BALANCE */}
        <View style={styles.heroCard}>
          <View style={styles.heroBubble} />
          <View style={styles.heroBubble2} />

          <Text style={styles.heroLabel}>{t('wallet.balance.available')}</Text>
          <Text style={styles.heroAmount}>
            {available.toFixed(2)} <Text style={styles.heroCurrency}>ETB</Text>
          </Text>

          <View style={styles.heroFooter}>
            <View style={styles.heroPill}>
              <View style={styles.heroDot} />
              <Text style={styles.heroPillText}>{t('wallet.balance.active')}</Text>
            </View>
            <Text style={styles.heroTotalText}>
              {t('wallet.balance.totalEarned', { amount: totalEarned.toFixed(2) })}
            </Text>
          </View>
        </View>

        {/* MAIN LAYOUT WRAPPER */}
        <View style={{ gap: 16 }}>
          <View style={styles.overviewGrid}>

            {/* PAYOUT METHOD COLUMN */}
            <View style={styles.gridCol}>
              <View style={[styles.payoutCard, { margin: 0, flex: 1 }]}>
                <Text style={styles.sectionTitle}>{t('wallet.payoutMethod.title')}</Text>

                {!payoutMethod ? (
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.text + '80', fontSize: 13 }}>
                      {t('wallet.payoutMethod.none')}
                    </Text>
                    <TouchableOpacity
                      style={[styles.withdrawBtn, { marginTop: 12 }]}
                      onPress={openEditModal}
                    >
                      <Ionicons name="add-circle-outline" size={18} color="#fff" />
                      <Text style={styles.withdrawBtnText}>{t('wallet.payoutMethod.setup')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.payoutMethodRow, { flex: 1 }]}>
                    <View style={styles.payoutMethodIcon}>
                      <Ionicons
                        name={payoutMethod.payout_channel === 'BANK_TRANSFER' ? "business-outline" : "phone-portrait-outline"}
                        size={20}
                        color={theme.colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.payoutMethodName}>
                        {payoutMethod.payout_channel === 'BANK_TRANSFER'
                          ? t('wallet.payoutMethod.bankTransfer')
                          : payoutMethod.payout_channel}
                        {` (${payoutMethod.bank_name})`}
                      </Text>
                      <Text style={styles.payoutMethodDetail}>
                        {payoutMethod.account_number}
                      </Text>
                      {payoutMethod.account_name ? (
                        <Text style={[styles.payoutMethodDetail, { fontWeight: '500', opacity: 0.9 }]}>
                          {payoutMethod.account_name}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity onPress={openEditModal}>
                      <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 13 }}>
                        {t('wallet.payoutMethod.edit')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* WITHDRAW FUNDS COLUMN */}
            <View style={styles.gridCol}>
              <View style={[styles.summaryCard, { margin: 0, flex: 1 }]}>
                <Text style={styles.sectionTitle}>{t('wallet.withdraw.title')}</Text>

                <TextInput
                  value={amount}
                  onChangeText={(text) => {
                    if (uiError) setUiError(null);
                    if (uiSuccess) setUiSuccess(null);
                    const sanitized = text.replace(/[^0-9.]/g, '');
                    const parts = sanitized.split('.');
                    if (parts.length > 2) return;
                    setAmount(sanitized);
                  }}
                  placeholder={t('wallet.withdraw.amountPlaceholder')}
                  placeholderTextColor={theme.colors.text + '50'}
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    padding: 12,
                    borderRadius: 12,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                />

                {uiError && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fee2e2',
                    padding: 10,
                    borderRadius: 10,
                    gap: 6,
                    marginBottom: 12
                  }}>
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text style={{ color: '#b91c1c', fontSize: 12, fontWeight: '500', flex: 1 }}>
                      {uiError}
                    </Text>
                  </View>
                )}

                {uiSuccess && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#dcfce7',
                    padding: 10,
                    borderRadius: 10,
                    gap: 6,
                    marginBottom: 12
                  }}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                    <Text style={{ color: '#15803d', fontSize: 12, fontWeight: '500', flex: 1 }}>
                      {uiSuccess}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleWithdraw}
                  disabled={submitting || !payoutMethod || isInvalidAmount}
                  style={[
                    styles.withdrawBtn,
                    { opacity: (submitting || !payoutMethod || isInvalidAmount) ? 0.4 : 1 }
                  ]}
                >
                  <Ionicons name="cash-outline" size={18} color="#fff" />
                  <Text style={styles.withdrawBtnText}>
                    {submitting ? t('wallet.withdraw.processing') : t('wallet.withdraw.button')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* WITHDRAWALS HISTORY ROW */}
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <View style={[styles.listSection, { marginHorizontal: 0 }]}>
              <Text style={[styles.sectionTitle, { padding: 16, marginBottom: 0 }]}>
                {t('wallet.history.title')}
              </Text>

              {withdrawals?.length === 0 ? (
                <Text style={{ padding: 16, color: theme.colors.text + '70', fontSize: 13 }}>
                  {t('wallet.history.empty')}
                </Text>
              ) : (
                withdrawals.map((w: any, i: number) => (
                  <View key={w.id} style={[styles.txRow, i !== withdrawals.length - 1 && styles.txRowBorder]}>
                    <View style={styles.txAvatar}>
                      <Text style={[styles.txAvatarText, { color: theme.colors.primary }]}>₮</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txName}>{w.amount} ETB</Text>
                      <Text style={styles.txMeta}>
                        {w.payout_channel} • {w.status}
                      </Text>
                    </View>
                    <Text style={styles.txAmount}>
                      {w.status === 'PENDING'
                        ? t('wallet.history.pending')
                        : t('wallet.history.done')}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL CONFIGURATION */}
      <Modal visible={payoutModalVisible} transparent animationType="fade">
        <View style={modalStyles.modalOverlay}>
          <View style={[modalStyles.modalCard, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
              {t('wallet.payoutMethod.modalTitle')}
            </Text>

            <Text style={{ fontSize: 11, color: theme.colors.text + '70', marginBottom: 6, fontWeight: '600' }}>
              {t('wallet.payoutMethod.selectOption')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {/* Telebirr Choice */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: form.payout_channel === 'TELEBIRR' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: form.payout_channel === 'TELEBIRR' ? theme.colors.primary + '12' : 'transparent',
                }}
                onPress={() => setForm({ ...form, payout_channel: 'TELEBIRR', bank_name: 'Telebirr' })}
              >
                <Text style={{ color: form.payout_channel === 'TELEBIRR' ? theme.colors.primary : theme.colors.text, fontWeight: '600', fontSize: 11 }}>
                  {t('wallet.payoutMethod.telebirr')}
                </Text>
              </TouchableOpacity>

              {/* CBE Birr Choice */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: form.payout_channel === 'CBE' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: form.payout_channel === 'CBE' ? theme.colors.primary + '12' : 'transparent',
                }}
                onPress={() => setForm({ ...form, payout_channel: 'CBE', bank_name: 'Commercial Bank of Ethiopia (CBE)' })}
              >
                <Text style={{ color: form.payout_channel === 'CBE' ? theme.colors.primary : theme.colors.text, fontWeight: '600', fontSize: 11 }}>
                  {t('wallet.payoutMethod.cbeBirr')}
                </Text>
              </TouchableOpacity>

              {/* General Bank Transfer Choice */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: form.payout_channel === 'BANK_TRANSFER' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: form.payout_channel === 'BANK_TRANSFER' ? theme.colors.primary + '12' : 'transparent',
                }}
                onPress={() => setForm({ ...form, payout_channel: 'BANK_TRANSFER', bank_name: '' })}
              >
                <Text style={{ color: form.payout_channel === 'BANK_TRANSFER' ? theme.colors.primary : theme.colors.text, fontWeight: '600', fontSize: 11 }}>
                  {t('wallet.payoutMethod.otherBank')}
                </Text>
              </TouchableOpacity>
            </View>

            {form.payout_channel === 'BANK_TRANSFER' && (
              <TextInput
                placeholder={t('wallet.payoutMethod.bankNamePlaceholder')}
                placeholderTextColor={theme.colors.text + '50'}
                value={form.bank_name}
                onChangeText={(text) => setForm({ ...form, bank_name: text })}
                style={[modalStyles.input, { borderColor: theme.colors.border, color: theme.colors.text, marginBottom: 12 }]}
              />
            )}

            <TextInput
              placeholder={t('wallet.payoutMethod.accountHolderPlaceholder')}
              placeholderTextColor={theme.colors.text + '50'}
              value={form.account_name}
              onChangeText={(text) => setForm({ ...form, account_name: text })}
              style={[modalStyles.input, { borderColor: theme.colors.border, color: theme.colors.text, marginBottom: 12 }]}
            />

            <TextInput
              placeholder={
                form.payout_channel === 'BANK_TRANSFER'
                  ? t('wallet.payoutMethod.bankAccountPlaceholder')
                  : t('wallet.payoutMethod.mobileWalletPlaceholder')
              }
              placeholderTextColor={theme.colors.text + '50'}
              value={form.account_number}
              onChangeText={(text) => setForm({ ...form, account_number: text })}
              style={[modalStyles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <TouchableOpacity
                onPress={() => setPayoutModalVisible(false)}
                style={[modalStyles.modalBtn, { backgroundColor: theme.colors.border + '50' }]}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                  {t('wallet.payoutMethod.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSavePayout}
                style={[modalStyles.modalBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {t('wallet.payoutMethod.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { padding: 20, borderRadius: 16, maxWidth: 380, alignSelf: 'center', width: '100%' },
  input: { borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 14 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
});

const createStyles = (theme: Theme, isWide: boolean) =>
  StyleSheet.create({
    scrollContent: { paddingBottom: 48 },
    heroCard: { margin: theme.spacing.lg, borderRadius: 20, backgroundColor: theme.colors.primary, padding: 24, overflow: 'hidden', minHeight: isWide ? 140 : 160, justifyContent: 'flex-end' },
    heroBubble: { position: 'absolute', top: -50, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)' },
    heroBubble2: { position: 'absolute', top: 30, right: 60, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },
    heroLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 6 },
    heroAmount: { fontSize: isWide ? 44 : 38, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
    heroCurrency: { fontSize: 20, fontWeight: '400', color: 'rgba(255,255,255,0.8)' },
    heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
    heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FCD34D' },
    heroPillText: { fontSize: 12, fontWeight: '500', color: '#FFFFFF' },
    heroTotalText: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
    overviewGrid: { flexDirection: isWide ? 'row' : 'column', paddingHorizontal: theme.spacing.lg, gap: 16 },
    gridCol: { flex: 1 },
    payoutCard: { backgroundColor: theme.colors.background, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, padding: 16 },
    payoutMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    payoutMethodIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    payoutMethodName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    payoutMethodDetail: { fontSize: 12, color: theme.colors.text + '70', marginTop: 1 },
    withdrawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 12 },
    withdrawBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    summaryCard: { backgroundColor: theme.colors.background, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, padding: 16 },
    listSection: { backgroundColor: theme.colors.background, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 14 },
    txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
    txRowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    txAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    txAvatarText: { fontSize: 13, fontWeight: '700' },
    txName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    txMeta: { fontSize: 12, color: theme.colors.text + '70', marginTop: 2 },
    txAmount: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  });