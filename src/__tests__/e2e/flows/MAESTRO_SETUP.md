# MedLink — Maestro E2E Testing Guide

## What is Maestro?

Maestro runs real user flows on an actual iOS Simulator or Android Emulator.
It taps buttons, types text, scrolls, and asserts what appears on screen —
exactly like a real user would. No code needed, just YAML files.

---

## Step 1 — Install Maestro

Run this in your terminal (anywhere, not inside the project):

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Restart your terminal, then verify:

```bash
maestro --version
# Expected: 1.x.x
```

---

## Step 2 — Add testID props to your app

Maestro finds elements by `testID`. You need to add these to key components.

### LoginForm.tsx
Find your email and password inputs and add `testID`:

```tsx
// src/features/auth/components/LoginForm.tsx
<TextInput
  testID="login-email-input"
  placeholder={t("auth:email")}
  ...
/>

<TextInput
  testID="login-password-input"
  placeholder={t("auth:password")}
  ...
/>

<Pressable testID="login-submit-button" onPress={handleLogin}>
  ...
</Pressable>
```

### Register screen (app/(auth)/register.tsx)
```tsx
<TextInput testID="register-firstname-input" ... />
<TextInput testID="register-lastname-input" ... />
<TextInput testID="register-email-input" ... />
<TextInput testID="register-password-input" ... />
<Pressable testID="register-submit-button" ... />
```

### Home screen (app/(tabs)/index.tsx)
```tsx
<TextInput testID="search-bar" ... />         // search bar
<Pressable testID="doctor-card-0" ... />      // first doctor card
<Pressable testID="book-button" ... />        // book button on doctor profile
```

### BookingModal
```tsx
<Pressable testID="slot-0" ... />             // first time slot
<Pressable testID="confirm-booking-button" />  // confirm booking
```

### Public landing (app/(public)/index.tsx)
```tsx
<Pressable testID="landing-login-button" onPress={onLogin} />
<Pressable testID="landing-signup-button" onPress={onSignup} />
```

---

## Step 3 — Build a dev client (required for Maestro)

Maestro cannot run on Expo Go. You need a development build.

### iOS Simulator:
```bash
npx expo run:ios
```

### Android Emulator:
```bash
npx expo run:android
```

Wait until the app is fully built and running on the simulator/emulator.

---

## Step 4 — Find your app bundle ID

### iOS:
```bash
# After running expo run:ios, check the build output for:
# Bundle ID: host.exp.exponent  (Expo Go)
# or your custom: com.medlink.app

# Run this to find it:
xcrun simctl list apps booted | grep -i medlink
```

### Android:
```bash
adb shell pm list packages | grep medlink
```

Update the `appId` field in every YAML flow file to match.

---

## Step 5 — Run a flow

```bash 
# Run a single flow
maestro test e2e/flows/01_patient_login.yaml

# Run all flows in order
maestro test e2e/flows/

# Run with video recording
maestro test e2e/flows/ --format junit --output e2e/results/
```

---

## Folder Structure

```
frontend/
└── e2e/
    ├── flows/
    │   ├── 01_patient_login.yaml
    │   ├── 02_patient_search_and_book.yaml
    │   ├── 03_patient_payment.yaml
    │   ├── 04_doctor_login_and_manage.yaml
    │   └── 05_doctor_accept_appointment.yaml
    ├── results/           ← generated reports go here
    └── README.md          ← this file
```

---
## Generating E2E Reports

```bash
# JUnit XML (for documentation)
maestro test e2e/flows/ --format junit --output e2e/results/report.xml

# With screenshots on failure
maestro test e2e/flows/ --format junit --output e2e/results/

# View results
open e2e/results/
```