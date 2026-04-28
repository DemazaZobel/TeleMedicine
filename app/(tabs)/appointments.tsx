import React from 'react';
import { ComingSoon } from '../../src/components/ui';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';

export default function AppointmentsScreen() {
  const isDoctor = useAuthStore((s) => s.user?.role === 'DOCTOR');
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());

  if (isDoctor && !isVerified) {
    return <PendingApproval />;
  }

  return (
    <ComingSoon
      title="Booking System"
      description="The appointment booking and management system is currently under construction. Check back soon!"
      icon="📅"
    />
  );
}
