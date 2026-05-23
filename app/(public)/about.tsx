import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../src/components/ui';
import { useTheme } from '../../src/theme';
import logo from '../../assets/images/logo.png';

const TEAM = [
  {
    name: 'Bemnet Beyene',
    role: 'Frontend Developer',
    gender: 'F',
    color: '#8B5CF6',
    desc: 'Software Engineering graduate specializing in React Native and mobile UI design.',
  },
  {
    name: 'Birtukan Kussa',
    role: 'Frontend Developer',
    gender: 'F',
    color: '#EC4899',
    desc: 'Software Engineering graduate focused on user experience and component architecture.',
  },
  {
    name: 'Betlehem Seleshi',
    role: 'Frontend Developer',
    gender: 'F',
    color: '#F59E0B',
    desc: 'Software Engineering graduate passionate about accessible and beautiful interfaces.',
  },
  {
    name: 'Beno Fessiha',
    role: 'Backend Developer',
    gender: 'M',
    color: '#3B82F6',
    desc: 'Software Engineering graduate specializing in API design and system architecture.',
  },
  {
    name: 'Bekalu Bekele',
    role: 'Backend Developer',
    gender: 'M',
    color: '#10B981',
    desc: 'Software Engineering graduate focused on database design and server infrastructure.',
  },
];

export default function AboutScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isMobile = width < 768;

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: isMobile ? 16 : 48, paddingTop: 24, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>Back</Text>
          </Pressable>
          <Image source={logo} style={{ width: 100, height: 32, resizeMode: 'contain' }} />
          <View style={{ width: 60 }} />
        </View>

        {/* Hero banner */}
        <View style={{ backgroundColor: isDark ? '#0a5c4e' : '#ecfdf5', paddingHorizontal: isMobile ? 24 : 64, paddingVertical: isMobile ? 40 : 64, alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: isDark ? theme.colors.border : '#bbf7d0' }}>
          
          <Text style={{ fontSize: isMobile ? 28 : 36, fontWeight: '800', color: isDark ? '#fff' : '#065f46', textAlign: 'center', lineHeight: isMobile ? 36 : 46 }}>
            About Medlink
          </Text>
          <Text style={{ fontSize: 15, color: isDark ? '#dcfce7' : '#047857', textAlign: 'center', lineHeight: 24, maxWidth: 600 }}>
            Medlink is Ethiopia's modern digital healthcare platform built to connect patients with trusted doctors — making quality healthcare accessible, fast, and reliable for everyone, anywhere.
          </Text>
        </View>

        <View style={{ paddingHorizontal: isMobile ? 16 : 64, paddingVertical: isMobile ? 32 : 56, gap: 48 }}>

          {/* Our Story */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text }}>Our Story</Text>
            <View style={{ width: 48, height: 3, borderRadius: 2, backgroundColor: theme.colors.primary }} />
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 26 }}>
              Medlink was born out of a shared frustration with the fragmented state of healthcare access in Ethiopia. As a team of five Software Engineering graduates, we witnessed firsthand how difficult it was for patients to find the right doctor, book appointments, and manage their health records — all without a unified digital system.
            </Text>
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 26 }}>
              We set out to build a platform that bridges this gap — a place where patients can discover verified specialists, book appointments in seconds, and consult remotely when needed. Medlink is our answer to that challenge: a full-stack healthcare platform built with modern technology, Ethiopian patients in mind, and a deep commitment to improving lives through better access to care.
            </Text>
          </View>

          {/* What We Built */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text }}>What We Built</Text>
            <View style={{ width: 48, height: 3, borderRadius: 2, backgroundColor: theme.colors.primary }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {[
                { icon: 'phone-portrait-outline', title: 'Cross-Platform App', desc: 'Built with React Native and Expo, Medlink runs on iOS, Android, and web from a single codebase.' },
                { icon: 'server-outline', title: 'Robust Backend', desc: 'A Django REST Framework API powers secure authentication, appointment management, and doctor profiles.' },
                { icon: 'shield-checkmark-outline', title: 'Doctor Verification', desc: 'A multi-step verification system ensures every doctor on the platform is authenticated and trusted.' },
                { icon: 'videocam-outline', title: 'Online Consultations', desc: 'Patients can consult with doctors remotely through secure video and messaging features.' },
                { icon: 'notifications-outline', title: 'Smart Reminders', desc: 'Automated appointment reminders and follow-ups keep patients on track with their healthcare.' },
                { icon: 'card-outline', title: 'Payment Integration', desc: 'Chapa payment integration enables seamless appointment payments within the platform.' },
              ].map((item) => (
                <View key={item.title} style={{ width: isMobile ? '100%' : '47%', flexDirection: 'row', gap: 14, backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isDark ? theme.colors.background : '#ecfdf5', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ionicons name={item.icon as any} size={22} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text }}>{item.title}</Text>
                    <Text style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 }}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Team */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: isMobile ? 22 : 26, fontWeight: '800', color: theme.colors.text }}>Meet the Team</Text>
            <View style={{ width: 48, height: 3, borderRadius: 2, backgroundColor: theme.colors.primary }} />
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 24 }}>
              Five Software Engineering graduates who turned a shared vision into a working product.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
              {TEAM.map((member) => (
                <View key={member.name} style={{ width: isMobile ? '100%' : '30%', backgroundColor: theme.colors.surface, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
                  {/* Color top bar */}
                  <View style={{ height: 6, backgroundColor: member.color }} />
                  <View style={{ padding: 20, gap: 10, alignItems: 'center' }}>
                    {/* Avatar */}
                    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: member.color + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: member.color + '44' }}>
                      <Ionicons name={member.gender === 'F' ? 'person' : 'person'} size={36} color={member.color} />
                    </View>
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.text, textAlign: 'center' }}>{member.name}</Text>
                      <View style={{ backgroundColor: member.color + '18', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: member.color }}>{member.role}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>{member.desc}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      <Text style={{ fontSize: 11, color: theme.colors.textSecondary, backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' }}>Software Engineering</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Mission */}
          <View style={{ backgroundColor: isDark ? '#0a5c4e' : '#ecfdf5', borderRadius: 20, padding: isMobile ? 24 : 36, gap: 12, borderWidth: 1, borderColor: isDark ? theme.colors.border : '#bbf7d0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="heart" size={24} color={theme.colors.primary} />
              <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#fff' : '#065f46' }}>Our Mission</Text>
            </View>
            <Text style={{ fontSize: 15, color: isDark ? '#dcfce7' : '#047857', lineHeight: 26 }}>
              To make quality healthcare accessible to every Ethiopian through technology — breaking down barriers of distance, cost, and complexity so that finding and connecting with the right doctor is as simple as a few taps.
            </Text>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}