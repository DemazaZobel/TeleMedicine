import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme';

export default function TermsAndConditions() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Terms & Conditions
        </Text>

        <Text style={[styles.updated, { color: theme.colors.textSecondary }]}>
          Last updated: May 2026
        </Text>

        <Section title="1. Acceptance of Terms">
          By creating an account on Medlink, you agree to these Terms & Conditions.
          If you do not agree, you may not use the application.
        </Section>

        <Section title="2. Nature of the Service">
          Medlink is a digital healthcare platform that connects patients with
          licensed medical professionals. It does not replace emergency services
          or in-person medical care.
        </Section>

        <Section title="3. User Accounts">
          You are responsible for maintaining the confidentiality of your account
          credentials. You agree to provide accurate and truthful information when
          registering as either a patient or a doctor.
        </Section>

        <Section title="4. Medical Disclaimer">
          All medical advice provided through Medlink is for informational purposes
          only. Always seek professional medical help for serious conditions or emergencies.
        </Section>

        <Section title="5. Doctor Verification">
          Doctors using Medlink may be required to submit valid credentials.
          However, Medlink does not guarantee diagnosis accuracy or treatment outcomes.
        </Section>

        <Section title="6. Data Privacy">
          We collect only necessary personal data such as name, email, and usage
          activity to improve the service. Your data will never be sold to third parties.
        </Section>

        <Section title="7. User Conduct">
          Users must not misuse the platform, upload harmful content, or impersonate
          others. Violations may result in account suspension or termination.
        </Section>

        <Section title="8. Limitation of Liability">
          Medlink is not liable for any indirect, incidental, or consequential damages
          arising from the use of the platform.
        </Section>

        <Section title="9. Changes to Terms">
          We may update these Terms occasionally. Continued use of the app means you
          accept the updated terms.
        </Section>

        <Text style={[styles.footer, { color: theme.colors.textSecondary }]}>
          By continuing, you acknowledge that you have read and agree to these Terms.
        </Text>

      </ScrollView>
    </View>
  );
}

function Section({ title, children }: any) {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  updated: {
    fontSize: 13,
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    fontSize: 13,
    fontStyle: 'italic',
  },
});