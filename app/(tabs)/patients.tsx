import React from 'react';
import { ScreenContainer } from '../../src/components/ui';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { PendingApproval } from '../../src/features/doctor/components/PendingApproval';
import { useAuthStore } from '../../src/store/authStore';
import { useDoctorStore } from '../../src/store/doctor.store';

/** Doctor-only tab — hidden for PATIENT and ADMIN roles via the tabs layout. */
export default function PatientsScreen() {
  const isDoctor = useAuthStore((s) => s.user?.role === 'DOCTOR');
  const isVerified = useDoctorStore((s) => s.isDoctorVerified());

  if (isDoctor && !isVerified) {
    return <PendingApproval />;
  }

  return (
    <ScreenContainer centered>
      <EmptyState
        icon="people-outline"
        title="Your Patients"
        description="Patient list will appear here once you have appointments."
      />
    </ScreenContainer>
  );
}

