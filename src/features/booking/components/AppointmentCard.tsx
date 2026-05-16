import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/ui";
import { useBookingStore } from "../../../store/booking.store";
import { useDiscoveryStore } from "../../../store/discovery.store";
import type { Theme } from "../../../theme";
import { useTheme } from "../../../theme";
import type { AppointmentDetail } from "../types/bookingTypes";
import { CancelAppointmentModal } from "./CancelAppointmentModal";
import { RescheduleModal } from "./RescheduleModal";

interface AppointmentCardProps {
  appointment: AppointmentDetail;
  isDoctor: boolean;
  onCancel?: (id: string | number, reason: string) => void;
  onAccept?: (id: string | number) => void;
}

export function AppointmentCard({
  appointment,
  isDoctor,
  onCancel,
  onAccept,
}: AppointmentCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    doctorDecision,
    requestReschedule,
    respondToChangeRequest,
    isLoading,
    cancelAppointment,
  } = useBookingStore();
  const { doctors } = useDiscoveryStore();

  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const start = new Date(appointment.scheduled_start);
  const end = new Date(appointment.scheduled_end);
  const isPast = end < new Date();

  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const getStatus = () => {
    const status = appointment.status?.toUpperCase() || "UNKNOWN";
    
    // Virtual status override for expired appointments
    if (isPast && !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)) {
      return { label: "Expired", color: theme.colors.textTertiary };
    }

    const map: Record<string, { label: string; color: string }> = {
      CONFIRMED: {
        label:
          appointment.payment_status === "paid"
            ? "Confirmed"
            : appointment.payment_status === "charge_pending"
              ? "Verifying..."
              : "Unpaid",
        color:
          appointment.payment_status === "paid"
            ? theme.colors.success
            : appointment.payment_status === "charge_pending"
              ? theme.colors.primary
              : theme.colors.warning,
      },
      REQUESTED: { label: "Pending", color: theme.colors.textTertiary },
      COMPLETED: { label: "Completed", color: theme.colors.primary },
      CANCELLED: { label: "Cancelled", color: theme.colors.error },
      NO_SHOW: { label: "No Show", color: theme.colors.error },
      EXPIRED: { label: "Expired", color: theme.colors.textTertiary },
    };
    return map[status] || { label: status, color: theme.colors.textSecondary };
  };
  const { label: statusLabel, color: statusColor } = getStatus();

  // Name Logic: handle both flat fields (new API) and nested objects (legacy)
  const a = appointment as any;
  const patientName =
    `${a.patient_first_name || a.patient?.user?.first_name || ""} ${a.patient_last_name || a.patient?.user?.last_name || ""}`.trim() ||
    "Patient";
  const doctorFirstName =
    a.doctor_first_name || a.doctor?.user?.first_name || "";
  const doctorLastName = a.doctor_last_name || a.doctor?.user?.last_name || "";
  const doctorName = `${doctorFirstName} ${doctorLastName}`.trim();
  const formattedDoctorName = doctorName ? `Dr. ${doctorName}` : "Doctor";

  const displayName = isDoctor ? patientName : formattedDoctorName;

  const handleJoin = async () => {
    try {
      setLocalLoading(true);
      const { getJoinLink } = useBookingStore.getState();
      const link = await getJoinLink(appointment.id);
      await WebBrowser.openBrowserAsync(link);
    } catch (error: any) {
      Alert.alert(
        "Cannot Join Yet",
        error.response?.data?.detail || error.message || "Consultation is not open yet."
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      const {
        fetchPaymentMethods,
        initiatePayment,
        addPaymentMethod,
        verifyPaymentMethod,
        verifyPayment,
      } = useBookingStore.getState();
      await fetchPaymentMethods();
      let { paymentMethods } = useBookingStore.getState();

      let methodToUse =
        paymentMethods.find((m) => m.is_verified) || paymentMethods[0];
      if (!methodToUse) {
        try {
          methodToUse = await addPaymentMethod({
            payment_type: "chapa",
            provider: "chapa",
          });
          methodToUse = await verifyPaymentMethod(methodToUse.id, "1234");
        } catch (err) {
          Alert.alert(
            "No Payment Method",
            "Please add a payment method in your profile settings first.",
          );
          return;
        }
      } else if (!methodToUse.is_verified) {
        try {
          methodToUse = await verifyPaymentMethod(methodToUse.id, "1234");
        } catch (err) {
          Alert.alert(
            "Verification Failed",
            "Could not verify the existing payment method.",
          );
          return;
        }
      }

      const checkoutUrl = await initiatePayment(appointment.id, methodToUse.id);
      await WebBrowser.openBrowserAsync(checkoutUrl);

      // Backend team requirement: call verification immediately to trigger status change
      try {
        setLocalLoading(true);
        const { verifyPayment } = useBookingStore.getState();
        await verifyPayment(appointment.id);
      } catch (e) {
        console.log("Immediate verification check failed:", e);
      } finally {
        setLocalLoading(false);
      }

      // Poll for payment status after browser closes (webhook may take time)
      let attempts = 0;
      const maxAttempts = 12; // 12 × 5s = 60 seconds
      const poll = async () => {
        if (attempts >= maxAttempts) return;
        attempts++;
        const { verifyPayment } = useBookingStore.getState();
        await verifyPayment(appointment.id);
        const updated = useBookingStore
          .getState()
          .appointments.find((a) => a.id === appointment.id);
        if (updated && updated.payment_status === "paid") {
          return; // Payment confirmed, stop polling
        }
        setTimeout(poll, 5000);
      };
      setTimeout(poll, 3000); // First check after 3s
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        error.message ||
        "Failed to initiate payment.";
      if (
        errorMessage.includes("already been initiated") ||
        errorMessage.includes("charge_pending")
      ) {
        Alert.alert(
          "Payment In Progress",
          'Your payment is being verified. Tap "Refresh Status" to check for updates.',
        );
      } else {
        Alert.alert("Payment Error", errorMessage);
      }
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
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();
      if (isDoctor) {
        await doctorDecision(appointment.id, {
          action: "propose_change",
          ...payload,
          expires_at: expiresAt,
        });
      } else {
        await requestReschedule(appointment.id, {
          ...payload,
          expires_at: expiresAt,
        });
      }
      setRescheduleVisible(false);
      Alert.alert("Success", "Reschedule request sent.");
    } catch (error) {
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRespondChange = async (action: "accept" | "reject") => {
    if (!appointment.latest_change_request) return;
    try {
      const msg =
        action === "accept"
          ? "Accept this new time?"
          : "Reject this proposed change?";
      const confirmed =
        Platform.OS === "web"
          ? window.confirm(msg)
          : await new Promise((resolve) => {
              Alert.alert("Review Reschedule", msg, [
                { text: "No", style: "cancel", onPress: () => resolve(false) },
                { text: "Yes", style: "default", onPress: () => resolve(true) },
              ]);
            });

      if (!confirmed) return;

      setLocalLoading(true);
      await respondToChangeRequest(appointment.latest_change_request.id, {
        action,
      });
      Alert.alert("Success", `Reschedule ${action}ed.`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to respond.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    try {
      setLocalLoading(true);
      const result = await cancelAppointment(appointment.id, { confirm: true });
      setCancelVisible(false);
      
      if (result.late_cancellation) {
        Alert.alert("Late Cancellation", result.message);
      } else {
        Alert.alert("Success", result.message || "Appointment cancelled.");
      }
    } catch (err: any) {
      Alert.alert(
        "Cancel Error",
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          err.message ||
          "Failed to cancel appointment.",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLocalLoading(true);
      const { completeAppointment } = useBookingStore.getState();
      await completeAppointment(appointment.id);
      Alert.alert("Success", "Consultation completed.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to complete.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isCancelled = appointment.status?.toUpperCase() === "CANCELLED";
  const isCompleted = appointment.status?.toUpperCase() === "COMPLETED";
  const isNoShow = appointment.status?.toUpperCase() === "NO_SHOW";
  const isExpired = appointment.status?.toUpperCase() === "EXPIRED" || (isPast && !isCompleted && !isCancelled);
  const isFinalized = isCancelled || isCompleted || isNoShow || isExpired;

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
                {appointment.mode === "ONLINE" ? "Online" : "In-Person"}
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
            <Text style={styles.infoLabel}>REASON FOR VISIT</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{appointment.reason}</Text>
          </View>
        )}

        {appointment.latest_change_request && appointment.latest_change_request.status === 'PENDING' && (
          <View style={styles.proposalCard}>
            <View style={styles.proposalTag}>
              <Ionicons name="swap-horizontal" size={12} color={theme.colors.warning} />
              <Text style={styles.proposalTagText}>PROPOSED CHANGE</Text>
            </View>
            <Text style={styles.proposalDetails}>
              {new Date(appointment.latest_change_request.proposed_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} @ {new Date(appointment.latest_change_request.proposed_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            {((!isDoctor && appointment.latest_change_request.requested_by?.role === 'DOCTOR') || 
              (isDoctor && appointment.latest_change_request.requested_by?.role === 'PATIENT')) && (
              <View style={styles.proposalActions}>
                <TouchableOpacity 
                  style={styles.proposalBtnReject} 
                  onPress={() => handleRespondChange('reject')}
                >
                  <Text style={styles.proposalBtnRejectText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.proposalBtnAccept} 
                  onPress={() => handleRespondChange('accept')}
                >
                  <Text style={styles.proposalBtnAcceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {!isFinalized && (
        <View style={styles.cardActions}>
          {!isDoctor &&
            ["REQUESTED", "CONFIRMED"].includes(
              appointment.status?.toUpperCase() || "",
            ) &&
            !isPast && (
              <Button
                title="Cancel"
                variant="danger"
                size="sm"
                onPress={() => setCancelVisible(true)}
                style={styles.actionBtn}
              />
            )}

          {["REQUESTED", "CONFIRMED"].includes(
            appointment.status?.toUpperCase() || "",
          ) &&
            !isPast && (
              <Button
                title="Reschedule"
                variant="outline"
                size="sm"
                onPress={() => setRescheduleVisible(true)}
                style={styles.actionBtn}
              />
            )}

          {appointment.status?.toUpperCase() === "CONFIRMED" && (
            appointment.payment_status === "paid" ? (
              <Button title="Join" size="sm" onPress={handleJoin} loading={localLoading} style={styles.mainBtn} />
            ) : (
              !isDoctor && (
                appointment.payment_status === "charge_pending" ? (
                  <Button title="Verifying..." size="sm" onPress={handleRefresh} loading={localLoading} style={styles.mainBtn} />
                ) : (
                  <Button title="Pay Now" size="sm" variant="secondary" onPress={handlePay} loading={localLoading} style={styles.payBtn} />
                )
              )
            )
          )}

          {isDoctor && appointment.status?.toUpperCase() === "CONFIRMED" && appointment.payment_status === "paid" && isPast && (
            <Button title="Complete" size="sm" onPress={handleComplete} loading={localLoading} style={styles.mainBtn} />
          )}

          {isDoctor && appointment.status?.toUpperCase() === "REQUESTED" && (
            <Button 
              title="Accept" 
              size="sm"
              onPress={async () => {
                try {
                  setLocalLoading(true);
                  await onAccept?.(appointment.id);
                } finally {
                  setLocalLoading(false);
                }
              }} 
              loading={localLoading} 
              style={styles.mainBtn} 
            />
          )}
        </View>
      )}

      <RescheduleModal
        visible={rescheduleVisible}
        doctorId={appointment.doctor?.id || (appointment as any).doctor_id || (appointment as any).doctor}
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.04)",
      ...theme.shadows.sm,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    identity: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
    },
    avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    name: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    modeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    modeText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      gap: 6,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
    },
    cardContent: {
      flex: 1,
      marginBottom: 20,
    },
    dateTimeContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 12,
    },
    dateTimeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dateTimeText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    infoSection: {
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.textTertiary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    proposalCard: {
      backgroundColor: theme.colors.warning + '08',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.warning + '20',
      marginTop: 4,
    },
    proposalTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    proposalTagText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.colors.warning,
    },
    proposalDetails: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 10,
    },
    proposalActions: {
      flexDirection: 'row',
      gap: 8,
    },
    proposalBtnReject: {
      flex: 1,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.error + '10',
      alignItems: 'center',
      justifyContent: 'center',
    },
    proposalBtnRejectText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.error,
    },
    proposalBtnAccept: {
      flex: 1,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    proposalBtnAcceptText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFF',
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.04)',
      paddingTop: 16,
      flexWrap: 'wrap',
      gap: 10,
    },
    actionBtn: {
      paddingHorizontal: 16,
    },
    rescheduleBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    rescheduleBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    mainBtn: {
      minWidth: 80,
    },
    payBtn: {
      minWidth: 90,
    },
    acceptBtn: {
      height: 36,
      paddingHorizontal: 20,
      borderRadius: 18,
      minWidth: 90,
    },
  });
