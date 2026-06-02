 =============================================================================
 MedLink — Maestro E2E Test Flows
 =============================================================================
 SETUP:
   1. Install Maestro: curl -Ls "https://get.maestro.mobile.dev" | bash
   2. Start your Expo dev build on a simulator/device:
        npx expo run:ios  (or run:android)
   3. Run a flow:
        maestro test e2e/flows/01_patient_login.yaml
   4. Run all flows:
       maestro test e2e/flows/
 =============================================================================