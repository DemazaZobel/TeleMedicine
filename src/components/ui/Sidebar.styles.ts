import { StyleSheet } from "react-native";
import type { Theme } from "../../theme";

export const createSidebarStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: 240,
      backgroundColor: theme.colors.background,

      borderRightWidth: 1,
      borderRightColor: theme.colors.border, // key line

      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      justifyContent: "space-between",
    },

    containerCollapsed: {
      width: 64,
      alignItems: "center",
      paddingHorizontal: 0,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 40,
      marginBottom: 16,
      paddingHorizontal: 8,
    },

    headerCollapsed: {
      paddingHorizontal: 0,
      justifyContent: "center",
      gap: 4,
    },

    toggleBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    toggleBtnHover: {
      backgroundColor: theme.colors.surface,
    },

    workspaceName: {
      marginLeft: 8,
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },

    collapseBtn: {
      position: "absolute",
      right: -10,
      top: 20,
      backgroundColor: theme.colors.background,
      borderRadius: 999,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 10,
    },

    section: {
      marginTop: 8,
    },

    sectionLabel: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: theme.colors.textSecondary,
      marginBottom: 6,
      paddingHorizontal: 6,
    },

    item: {
      flexDirection: "row",
      alignItems: "center",
      height: 40,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
      position: "relative",
    },

    itemCollapsed: {
      paddingHorizontal: 0,
      justifyContent: "center",
      width: 40,
    },

    itemActive: {},

    itemHover: {
      backgroundColor: theme.colors.surface,
    },

    activeBar: {
      position: "absolute",
      left: 0,
      top: 8,
      bottom: 8,
      width: 3,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    activeBarCollapsed: {
      left: 4,
    },

    itemText: {
      marginLeft: 10,
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },

    itemTextActive: {
      color: theme.colors.text,
      fontWeight: "600",
    },

    footer: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 12,
    },

    tooltip: {
      position: "absolute",
      left: 50,
      backgroundColor: theme.colors.surface,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },

    tooltipText: {
      fontSize: 12,
      color: theme.colors.text,
    },
  });