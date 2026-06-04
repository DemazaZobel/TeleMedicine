import { useTranslation } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Button } from "../../../components/ui";
import { useAuthStore } from "../../../store/authStore";
import { useBookingStore } from "../../../store/booking.store";
import { useTheme } from "../../../theme";
import type { AppointmentDetail } from "../types/bookingTypes";
import { CancelAppointmentModal } from "./CancelAppointmentModal";
import { RescheduleModal } from "./RescheduleModal";

interface AppointmentCardProps {
  appointment: AppointmentDetail;
  isDoctor: boolean;
  onCancel?: (id: string | number, reason: string) => void;
  onAccept?: (id: string | number) => void;
  onRefreshList?: () => void;
}

export function AppointmentCard({
  appointment,
  isDoctor,
  onCancel,
  onAccept,
  onRefreshList
}: AppointmentCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslation("appointmentCard");
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    doctorDecision,
    requestReschedule,
    acceptReschedule,
    rejectReschedule,
    cancelAppointment,
  } = useBookingStore();
  const user = useAuthStore((s) => s.user);

  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const [localStart, setLocalStart] = useState<Date>(new Date(appointment.scheduled_start));
  const [localEnd, setLocalEnd] = useState<Date>(new Date(appointment.scheduled_end));
  const [localProposalHidden, setLocalProposalHidden] = useState(false);

  useEffect(() => {
    const incomingStart = new Date(appointment.scheduled_start);
    const incomingEnd = new Date(appointment.scheduled_end);

    if (!localProposalHidden) {
      setLocalStart(incomingStart);
      setLocalEnd(incomingEnd);
    }
  }, [appointment.scheduled_start, appointment.scheduled_end, localProposalHidden]);

  const isPast = localEnd < new Date();

  const dateStr = localStart.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeStr = `${localStart.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })} - ${localEnd.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`;

  const getStatus = () => {
    const status = appointment.status?.toUpperCase() || "UNKNOWN";

    if (isPast && !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)) {
      return { label: t("status.expired"), color: theme.colors.textTertiary };
    }

    const map: Record<string, { label: string; color: string }> = {
      CONFIRMED: {
        label:
          appointment.payment_status === "paid"
            ? t("status.confirmed")
            : appointment.payment_status === "charge_pending"
              ? t("status.verifying")
              : t("status.unpaid"),
        color:
          appointment.payment_status === "paid"
            ? theme.colors.success
            : appointment.payment_status === "charge_pending"
              ? theme.colors.primary
              : theme.colors.warning,
      },
      REQUESTED: { label: t("status.pending"), color: theme.colors.warning },
      COMPLETED: { label: t("status.completed"), color: theme.colors.primary },
      CANCELLED: { label: t("status.cancelled"), color: theme.colors.error },
      NO_SHOW: { label: t("status.no_show"), color: theme.colors.error },
      EXPIRED: { label: t("status.expired"), color: theme.colors.textTertiary },
    };
    return map[status] || { label: status, color: theme.colors.textSecondary };
  };
  const { label: statusLabel, color: statusColor } = getStatus();

  const a = appointment as any;
  const patientName =
    `${a.patient_first_name || a.patient?.user?.first_name || ""} ${a.patient_last_name || a.patient?.user?.last_name || ""}`.trim() ||
    t("name.patient_fallback");
  const doctorFirstName = a.doctor_first_name || a.doctor?.user?.first_name || "";
  const doctorLastName = a.doctor_last_name || a.doctor?.user?.last_name || "";
  const doctorName = `${doctorFirstName} ${doctorLastName}`.trim();
  const formattedDoctorName = doctorName
    ? `${t("name.doctor_prefix")} ${doctorName}`
    : t("name.doctor_fallback");
  const displayName = isDoctor ? patientName : formattedDoctorName;

  const handleJoin = async () => {
    try {
      setLocalLoading(true);
      const { getJoinLink } = useBookingStore.getState();
      const link = await getJoinLink(appointment.id);
      await WebBrowser.openBrowserAsync(link);
    } catch (error: any) {
      Alert.alert(
        t("alerts.join_error_title"),
        error.response?.data?.detail || error.message || t("alerts.join_error_default")
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setLocalLoading(true);
      const { fetchPaymentMethods, initiatePayment, addPaymentMethod, verifyPaymentMethod } = useBookingStore.getState();
      await fetchPaymentMethods();
      let { paymentMethods } = useBookingStore.getState();
      let methodToUse = paymentMethods?.find((m: any) => m.is_verified) || null;

      if (!methodToUse) {
        methodToUse = await addPaymentMethod({ provider: "TELEBIRR", account_number: "0912345678" });
        if (methodToUse && !methodToUse.is_verified) {
          try {
            methodToUse = await verifyPaymentMethod(methodToUse.id, "1234");
          } catch (err) {
            Alert.alert(t("alerts.payment_error_title"), t("alerts.payment_verify_failed"));
            return;
          }
        }
      }

      if (!methodToUse) {
        Alert.alert(t("alerts.payment_error_title"), t("alerts.payment_no_method"));
        return;
      }

      const checkoutUrl = await initiatePayment(appointment.id, methodToUse.id);
      if (!checkoutUrl) {
        Alert.alert(t("alerts.payment_error_title"), t("alerts.payment_no_url"));
        return;
      }

      await WebBrowser.openBrowserAsync(checkoutUrl);

      let attempts = 0;
      const maxAttempts = 12;

      const poll = async () => {
        try {
          if (attempts >= maxAttempts) return;
          attempts++;
          const { verifyPayment } = useBookingStore.getState();
          await verifyPayment(appointment.id);
          const updated = useBookingStore.getState().appointments.find((a) => a.id === appointment.id);

          if (updated && updated.payment_status === "paid") {
            Alert.alert(t("alerts.payment_success_title"), t("alerts.payment_success_body"));
            return;
          }
          setTimeout(poll, 5000);
        } catch (e) {
          console.log("Polling error:", e);
        }
      };
      setTimeout(poll, 3000);
    } catch (error: any) {
      Alert.alert(t("alerts.payment_error_title"), error?.message || t("alerts.payment_failed"));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLocalLoading(true);
      const { verifyPayment } = useBookingStore.getState();
      await verifyPayment(appointment.id);
    } catch (error) {
    } finally {
      setLocalLoading(false);
    }
  };

  const handleProposeConfirm = async (payload: any) => {
    try {
      setLocalLoading(true);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      if (isDoctor) {
        await doctorDecision(appointment.id, { action: "propose_change", ...payload, expires_at: expiresAt });
      } else {
        await requestReschedule(appointment.id, { ...payload, expires_at: expiresAt });
      }
      setRescheduleVisible(false);
      Alert.alert("Success", t("alerts.reschedule_success"));
      if (onRefreshList) onRefreshList();
    } catch (error: any) {
      Alert.alert(
        t("alerts.reschedule_error_title"),
        error?.response?.data?.detail || t("alerts.reschedule_failed")
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRespondChange = async (action: "accept" | "reject") => {
    const changeReq = appointment.latest_change_request;

    if (!changeReq || typeof changeReq !== "object") {
      Alert.alert("Error", t("alerts.respond_no_data"));
      return;
    }

    const changeRequestId = changeReq.id;
    if (!changeRequestId) {
      Alert.alert("Error", t("alerts.respond_missing_id"));
      return;
    }

    try {
      setLocalLoading(true);

      if (action === "accept") {
        await acceptReschedule(appointment.id, changeRequestId, isDoctor);

        if (changeReq.proposed_start && changeReq.proposed_end) {
          setLocalStart(new Date(changeReq.proposed_start));
          setLocalEnd(new Date(changeReq.proposed_end));
        }
      } else {
        await rejectReschedule(appointment.id, changeRequestId, isDoctor);
      }

      setLocalProposalHidden(true);
      Alert.alert(
        "Success",
        action === "accept" ? t("alerts.respond_accepted") : t("alerts.respond_rejected")
      );

      if (onRefreshList) {
        onRefreshList();
      }
    } catch (error: any) {
      Alert.alert(
        t("alerts.respond_error_title"),
        error.response?.data?.detail || error.message || t("alerts.respond_error_default")
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    try {
      setLocalLoading(true);
      await cancelAppointment(appointment.id, { confirm: true });
      setCancelVisible(false);
      Alert.alert("Success", t("alerts.cancel_success"));
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      Alert.alert(t("alerts.cancel_error_title"), err.message || t("alerts.cancel_error_default"));
    } finally {
      setLocalLoading(false);
    }
  };

  const statusUpper = appointment.status?.toUpperCase() || "";
  const isCancelled = statusUpper === "CANCELLED";
  const isCompleted = statusUpper === "COMPLETED";
  const isNoShow = statusUpper === "NO_SHOW";
  const isExpired = statusUpper === "EXPIRED" || (isPast && !isCompleted && !isCancelled);
  const isFinalized = isCancelled || isCompleted || isNoShow || isExpired;

  const hasPrimaryBtn =
    statusUpper === "CONFIRMED" &&
    (appointment.payment_status !== "paid" || appointment.mode === "ONLINE");

  const showProposal =
    !localProposalHidden &&
    appointment.latest_change_request &&
    appointment.latest_change_request.status?.toUpperCase() === "PENDING";

  // ─── PROPOSAL BANNER: Determine who should respond ───
  const proposalVisuals = useMemo(() => {
    const changeReq = appointment.latest_change_request;
    if (!showProposal || !changeReq) return null;

    console.log("[AppointmentCard] 🔍 changeReq raw:", JSON.stringify(changeReq, null, 2));
    console.log("[AppointmentCard] 👤 current user:", user?.id, "isDoctor:", isDoctor);

    const proposedDate = new Date(changeReq.proposed_start);
    const expirationDate = changeReq.expires_at ? new Date(changeReq.expires_at) : null;
    const now = new Date();
    const isExpiredToken = expirationDate ? now > expirationDate : false;

    const visualDateStr = proposedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const visualTimeStr = proposedDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

    const reqBy = changeReq.requested_by as any;
    const reqById = reqBy && typeof reqBy === "object" ? String(reqBy.id ?? "") : String(reqBy ?? "");
    const currentUserId = String(user?.id ?? "");

    if (currentUserId && reqById && reqById !== "" && currentUserId !== "") {
      const isRecipient = reqById !== currentUserId;
      return { visualDateStr, visualTimeStr, isRecipientOfReschedule: isRecipient, isExpiredToken };
    }

    const createdByRole = (changeReq.created_by_role as string | undefined)?.toUpperCase();
    if (createdByRole === "DOCTOR" || createdByRole === "PATIENT") {
      const isRecipient = isDoctor ? createdByRole === "PATIENT" : createdByRole === "DOCTOR";
      return { visualDateStr, visualTimeStr, isRecipientOfReschedule: isRecipient, isExpiredToken };
    }

    const reqByRole = (reqBy && typeof reqBy === "object" ? reqBy.role : undefined)?.toUpperCase();
    if (reqByRole === "DOCTOR" || reqByRole === "PATIENT") {
      const isRecipient = isDoctor ? reqByRole === "PATIENT" : reqByRole === "DOCTOR";
      return { visualDateStr, visualTimeStr, isRecipientOfReschedule: isRecipient, isExpiredToken };
    }

    if (reqById) {
      const doctorUserId = String(
        (appointment as any).doctor_user_id || appointment.doctor?.user?.id || ""
      );
      const patientUserId = String(
        (appointment as any).patient_user_id || appointment.patient?.user?.id || ""
      );
      if (reqById === doctorUserId) {
        const isRecipient = !isDoctor;
        return { visualDateStr, visualTimeStr, isRecipientOfReschedule: isRecipient, isExpiredToken };
      }
      if (reqById === patientUserId) {
        const isRecipient = isDoctor;
        return { visualDateStr, visualTimeStr, isRecipientOfReschedule: isRecipient, isExpiredToken };
      }
    }

    console.warn("[AppointmentCard] ⚠️ Layer 5 fallback: cannot determine proposer, defaulting isRecipient=true");
    return { visualDateStr, visualTimeStr, isRecipientOfReschedule: true, isExpiredToken };
  }, [showProposal, appointment.latest_change_request, isDoctor, user]);

  return (
    <View style={[styles.card, (isCancelled || isExpired) && { opacity: 0.6 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <View style={styles.modeRow}>
              <Ionicons
                name={appointment.mode === "ONLINE" ? "videocam-outline" : "business-outline"}
                size={12}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.modeText}>
                {appointment.mode === "ONLINE" ? t("mode.online") : t("mode.in_person")}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "12" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>{dateStr}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>{timeStr}</Text>
          </View>
        </View>

        {appointment.reason && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>{t("reason_label")}</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{appointment.reason}</Text>
          </View>
        )}

        {/* ─── PROPOSAL BANNER ─── */}
        {showProposal && proposalVisuals && (
          <View
            style={[
              styles.proposalCard,
              {
                marginTop: 12,
                padding: 12,
                backgroundColor: theme.colors.warning + "0A",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.warning,
              },
            ]}
          >
            <View style={styles.proposalHeaderRow}>
              <View style={styles.proposalTag}>
                <Ionicons name="time" size={14} color={theme.colors.warning} />
                <Text style={styles.proposalTagText}>{t("proposal.badge")}</Text>
              </View>
              <Text style={styles.proposalDateTimeBubble}>
                {proposalVisuals.visualDateStr} @ {proposalVisuals.visualTimeStr}
              </Text>
            </View>

            {proposalVisuals.isRecipientOfReschedule ? (
              <View style={styles.proposalActionBlock}>
                {proposalVisuals.isExpiredToken ? (
                  <Text style={[styles.proposalPromptText, { color: theme.colors.error, fontWeight: "500" }]}>
                    {t("proposal.expired_warning")}
                  </Text>
                ) : (
                  <Text style={styles.proposalPromptText}>
                    {isDoctor ? t("proposal.prompt_doctor") : t("proposal.prompt_patient")}
                  </Text>
                )}

                <View style={styles.proposalActions}>
                  <TouchableOpacity
                    style={[styles.proposalBtnReject, proposalVisuals.isExpiredToken && { opacity: 0.4 }]}
                    onPress={() => handleRespondChange("reject")}
                    disabled={localLoading || proposalVisuals.isExpiredToken}
                  >
                    <Text style={styles.proposalBtnRejectText}>{t("proposal.decline")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.proposalBtnAccept,
                      { backgroundColor: proposalVisuals.isExpiredToken ? "#BDC3C7" : "#2ECC71" },
                    ]}
                    onPress={() => handleRespondChange("accept")}
                    disabled={localLoading || proposalVisuals.isExpiredToken}
                  >
                    {localLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.proposalBtnAcceptText}>{t("proposal.accept")}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.proposalWaitingBlock}>
                <ActivityIndicator size="small" color={theme.colors.warning} style={{ marginRight: 8 }} />
                <Text style={styles.proposalPendingText}>
                  {isDoctor ? t("proposal.awaiting_patient") : t("proposal.awaiting_doctor")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ─── FOOTER CARD MAIN ACTIONS ─── */}
      {!isFinalized && (
        <View style={styles.cardActions}>
          {statusUpper === "REQUESTED" && isDoctor ? (
            <View style={styles.workflowRow}>
              <Button
                title={t("actions.decline")}
                variant="danger"
                size="sm"
                onPress={() => doctorDecision(appointment.id, { action: "reject" })}
                loading={localLoading}
                style={styles.splitActionBtn}
              />
              <Button
                title={t("actions.reschedule")}
                variant="outline"
                size="sm"
                onPress={() => setRescheduleVisible(true)}
                style={styles.splitActionBtn}
              />
              <Button
                title={t("actions.accept")}
                variant="primary"
                size="sm"
                onPress={() =>
                  onAccept
                    ? onAccept(appointment.id)
                    : doctorDecision(appointment.id, { action: "accept" })
                }
                loading={localLoading}
                style={styles.splitMainBtn}
              />
            </View>
          ) : (
            <View style={styles.workflowRow}>
              {!isDoctor &&
                ((statusUpper === "CONFIRMED" && !isPast) ||
                  (statusUpper === "REQUESTED" && !isPast)) && (
                  <Button
                    title={t("actions.cancel")}
                    variant="outline"
                    size="sm"
                    onPress={() => setCancelVisible(true)}
                    style={[
                      styles.cancelBtn,
                      !hasPrimaryBtn && { flex: 0, minWidth: 100, alignSelf: "flex-start" },
                    ]}
                    textStyle={styles.cancelBtnText}
                  />
                )}

              {isDoctor && ["REQUESTED", "CONFIRMED"].includes(statusUpper) && !isPast && (
                <Button
                  title={t("actions.reschedule")}
                  variant="outline"
                  size="sm"
                  onPress={() => setRescheduleVisible(true)}
                  style={styles.splitActionBtn}
                />
              )}

              {statusUpper === "CONFIRMED" &&
                (appointment.payment_status === "paid" ? (
                  appointment.mode === "ONLINE" ? (
                    (() => {
                      const now = new Date();
                      const entryBufferMs = 10 * 60 * 1000;
                      const windowOpenTime = new Date(localStart.getTime() - entryBufferMs);
                      const isJoinWindowActive = now >= windowOpenTime && now <= localEnd;

                      return (
                        <Button
                          title={t("actions.join")}
                          size="sm"
                          onPress={handleJoin}
                          loading={localLoading}
                          disabled={!isJoinWindowActive}
                          style={[styles.splitMainBtn, !isJoinWindowActive && { opacity: 0.5 }]}
                        />
                      );
                    })()
                  ) : (
                    <View style={styles.inPersonBadge}>
                      <Ionicons name="location-outline" size={14} color={theme.colors?.primary || "#2ECC71"} />
                      <Text style={styles.inPersonText}>{t("in_person_badge")}</Text>
                    </View>
                  )
                ) : (
                  !isDoctor &&
                  (appointment.payment_status === "charge_pending" ? (
                    <Button
                      title={t("actions.verifying")}
                      size="sm"
                      onPress={handleRefresh}
                      loading={localLoading}
                      style={styles.splitMainBtn}
                    />
                  ) : (
                    <Button
                      title={t("actions.pay_now")}
                      size="sm"
                      variant="primary"
                      onPress={handlePay}
                      loading={localLoading}
                      style={styles.splitMainBtn}
                    />
                  ))
                ))}
            </View>
          )}
        </View>
      )}

      <RescheduleModal
        visible={rescheduleVisible}
        doctorId={
          appointment.doctor?.id ||
          (appointment as any).doctor_id ||
          (appointment as any).doctor
        }
        isDoctor={isDoctor}
        onClose={() => setRescheduleVisible(false)}
        onConfirm={handleProposeConfirm}
        isLoading={localLoading}
      />

      <CancelAppointmentModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onConfirm={handleConfirmCancel}
        isLoading={localLoading}
      />
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { padding: 16, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    identity: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 16, fontWeight: 'bold' },
    name: { fontSize: 16, fontWeight: '600' },
    modeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    modeText: { fontSize: 12, marginLeft: 4 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
    cardContent: { marginBottom: 16 },
    dateTimeContainer: { flexDirection: 'row', backgroundColor: '#F8F9FA', padding: 8, borderRadius: 8, marginBottom: 12 },
    dateTimeItem: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
    dateTimeText: { fontSize: 14, marginLeft: 6, fontWeight: '500' },
    infoSection: { marginTop: 8 },
    infoLabel: { fontSize: 10, fontWeight: '700', color: '#999', marginBottom: 2 },
    infoValue: { fontSize: 14, color: '#333' },
    proposalCard: {},
    proposalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    proposalTag: { flexDirection: 'row', alignItems: 'center' },
    proposalTagText: { fontSize: 11, fontWeight: 'bold', color: '#E67E22', marginLeft: 4 },
    proposalDateTimeBubble: { backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12, fontWeight: '600', borderWidth: 1, borderColor: '#FFE0B2' },
    proposalActionBlock: { marginTop: 4 },
    proposalPromptText: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 18 },
    proposalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    proposalBtnReject: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 6, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FED7D7' },
    proposalBtnRejectText: { color: '#E53E3E', fontWeight: '600', fontSize: 13 },
    proposalBtnAccept: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: '#2ECC71', justifyContent: 'center', alignItems: 'center' },
    proposalBtnAcceptText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
    proposalWaitingBlock: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    proposalPendingText: { fontSize: 13, color: '#E67E22', fontStyle: 'italic' },

    /* ── FIXED FLEX CONTROLS ── */
    cardActions: {
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
      paddingTop: 12,
      marginTop: 8
    },
    workflowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%',
      flexWrap: 'wrap' // Gracefully wraps into multiple lines on narrow columns
    },
    splitMainBtn: {
      flex: 1.2,
      minWidth: 100
    },
    splitActionBtn: {
      flex: 1,
      minWidth: 90
    },
    cancelBtn: {
      flex: 1,
      minWidth: 90,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelBtnText: {
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    inPersonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6
    },
    inPersonText: {
      marginLeft: 4,
      fontSize: 13,
      fontWeight: '600',
      color: '#666'
    }
  });
}