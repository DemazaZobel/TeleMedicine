# MedLink Backend API Endpoint Specification

Comprehensive mapping of every API endpoint required to fulfill **FR1–FR27**.
Endpoints marked ✅ are already implemented. All others are **needed**.

> **Last updated:** May 6, 2026

---

## 1. Authentication (`auth` app) — FR1, FR4, FR26

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | POST | `/api/auth/register/` | Register patient or doctor | FR1 |
| ✅ | POST | `/api/auth/login/` | Email + password login, returns JWT pair | FR1 |
| ✅ | POST | `/api/auth/verify-email/` | Verify email with OTP code | FR1 |
| ✅ | POST | `/api/auth/token/refresh/` | Refresh access token | FR1 |
| ✅ | POST | `/api/auth/forgot-password/` | Request password reset email/OTP | FR4 |
| ✅ | POST | `/api/auth/reset-password/` | Confirm new password with code | FR4 |
| ✅ | POST | `/api/auth/logout/` | Blacklist refresh token on logout | FR1 |
| ✅ | PUT | `/api/auth/password/change/` | Change password (authenticated) | FR4 |
| ✅ | POST | `/api/auth/resend-otp/` | Resend email verification OTP | FR1 |
| ✅ | GET | `/api/auth/profile/` | Get current user's profile | FR3, FR4 |
| ✅ | PUT | `/api/auth/profile/` | Update current user's profile | FR3, FR4 |

---

## 2. User Profiles (`users` app) — FR3, FR4

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | GET | `/api/users/me/` | Get current user profile | FR3, FR4 |
| ✅ | PUT | `/api/users/me/` | Update current user profile (name, phone, avatar) | FR3, FR4 |

---

## 3. Patient (`patients` app) — FR3

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | GET | `/api/patients/me/medical-info/` | Get patient medical info (blood type, allergies, conditions) | FR3 |
| ✅ | PUT | `/api/patients/me/medical-info/` | Update patient medical info | FR3 |

---

## 4. Provider / Doctor (`providers` app) — FR2, FR5, FR6, FR7, FR17

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | GET | `/api/providers/profile/` | Get doctor's own profile (auto-creates) | FR2 |
| ✅ | PUT | `/api/providers/profile/` | Update specialization, experience, fee | FR2 |
| ✅ | POST | `/api/providers/documents/` | Upload verification document (multipart) | FR2 |
| ✅ | GET | `/api/providers/documents/list/` | List own uploaded documents | FR2 |
| ✅ | GET | `/api/providers/search/` | Search verified doctors (query, filters) | FR5, FR6 |
| 🔲 | GET | `/api/providers/{id}/` | Get public doctor detail (bio, experience, ratings, availability, fee) | FR7, FR17 |
| 🔲 | GET | `/api/providers/{id}/reviews/` | List reviews for a specific doctor | FR21 |

---

## 5. Appointments / Consultations — FR8, FR9, FR10, FR11

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | POST | `/api/appointments/book/` | Patient creates appointment request | FR8 |
| ✅ | GET | `/api/appointments/my/` | List own appointments (patient or doctor) | FR8, FR9 |
| ✅ | POST | `/api/appointments/{id}/cancel/` | Cancel an appointment (either party) | FR10 |
| ✅ | POST | `/api/appointments/{id}/doctor-decision/` | Doctor: accept or propose changes | FR9, FR10 |
| ✅ | POST | `/api/appointments/{id}/change-request/` | Provider proposes appointment changes | FR9 |
| ✅ | POST | `/api/appointments/change-requests/{id}/respond/` | Patient accepts/rejects provider changes | FR9 |
| ✅ | GET | `/api/appointments/{id}/join/` | View meeting link / join consultation | FR14 |

---

## 6. Provider Availability — FR7, FR8

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | GET | `/api/appointments/availability/` | Get doctor's availability slots | FR7, FR8 |
| ✅ | POST | `/api/appointments/availability/` | Set/update availability schedule | FR7, FR8 |

---

## 7. Notifications — FR11

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | GET | `/api/appointments/notifications/` | List user notifications (paginated) | FR11 |
| ✅ | POST | `/api/appointments/notifications/{id}/read/` | Mark notification as read | FR11 |
| ✅ | GET | `/api/appointments/notification-preferences/` | Get notification preferences | FR11 |
| ✅ | PUT | `/api/appointments/notification-preferences/` | Update notification preferences | FR11 |
| 🔲 | POST | `/api/notifications/register-device/` | Register push token (Expo/FCM) | FR11 |

---

## 8. Chat / Messaging — FR12, FR13, FR14, FR15

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | GET | `/api/chat/conversations/` | List conversations for current user | FR12 |
| 🔲 | POST | `/api/chat/conversations/` | Create or get conversation (between patient + doctor) | FR12 |
| 🔲 | GET | `/api/chat/conversations/{id}/messages/` | Get message history (paginated) | FR12, FR15 |
| 🔲 | POST | `/api/chat/conversations/{id}/messages/` | Send a text message | FR12 |
| 🔲 | POST | `/api/chat/conversations/{id}/files/` | Upload and share medical file in chat (multipart) | FR13 |
| 🔲 | POST | `/api/chat/conversations/{id}/video-link/` | Share external video link (Zoom/Meet) | FR14 |
| 🔲 | WS | `/ws/chat/{conversation_id}/` | WebSocket for real-time messaging (<2s) | FR12 |

---

## 9. Payments (`payments` app) — FR16, FR17, FR18, FR19

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | POST | `/api/payments/initiate/{appointment_id}/` | Initialize Chapa payment for an appointment | FR16 |
| ✅ | GET | `/api/payments/methods/` | List patient payment methods | FR16 |
| ✅ | POST | `/api/payments/methods/` | Add payment method | FR16 |
| ✅ | POST | `/api/payments/methods/{id}/verify/` | Verify payment method | FR16 |
| ✅ | GET | `/api/payments/history/` | Payment history for current user | FR16, FR17 |
| ✅ | POST | `/api/payments/complete/{appointment_id}/` | Mark appointment complete and release payout | FR10, FR19 |
| ✅ | POST | `/api/payments/no-show/{appointment_id}/` | Mark appointment as no-show | FR10 |
| ✅ | GET | `/api/payments/wallet/` | Doctor wallet balance | FR19 |
| ✅ | POST | `/api/payments/webhook/` | Chapa webhook callback | FR16 |
| 🔲 | GET | `/api/payments/{id}/receipt/` | Download PDF/email receipt for a payment | FR18 |
| 🔲 | POST | `/api/payments/wallet/withdraw/` | Doctor requests withdrawal of earnings | FR19 |

---

## 10. Reviews & Ratings — FR20, FR21

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | POST | `/api/reviews/` | Patient submits review (1–5 stars + comment, linked to appointment) | FR20 |
| 🔲 | GET | `/api/reviews/?doctor_id={id}` | List reviews for a doctor (public, paginated) | FR20, FR21 |

---

## 11. Admin Management — FR22, FR23, FR24, FR25

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | GET | `/api/admin/doctors/` | List all doctors with verification status | FR22 |
| ✅ | PATCH | `/api/admin/doctors/{id}/verify/` | Approve or reject a doctor's profile | FR22 |
| ✅ | GET | `/api/admin/users/` | List/search all users | FR23 |
| ✅ | PATCH | `/api/admin/users/{id}/` | Update user status (suspend/deactivate) | FR24 |
| ✅ | GET | `/api/admin/consultations/` | List all consultations | FR23 |
| ✅ | GET | `/api/admin/payments/` | List all payments | FR23 |
| ✅ | GET | `/api/admin/analytics/` | Dashboard metrics (user count, revenue, active doctors, etc.) | FR25 |

---

## 12. System / Security — FR26, FR27

These are **not traditional REST endpoints** but backend middleware and configuration:

| Item | Description | FR |
|------|-------------|-----|
| Role-based permissions | Django DRF `IsAuthenticated`, `IsDoctor`, `IsPatient`, `IsAdmin` permission classes | FR26 |
| Data encryption at rest | Database-level encryption for medical/personal fields | FR27 |
| HTTPS enforcement | TLS termination at reverse proxy | FR27 |
| Audit logging | Log access to sensitive medical data | FR27 |

---

## Summary

| Module | Implemented | Needed | Total |
|--------|------------|--------|-------|
| Auth | 11 | 0 | 11 |
| User Profiles | 2 | 0 | 2 |
| Patient | 2 | 0 | 2 |
| Provider (Doctor) | 5 | 2 | 7 |
| Appointments | 7 | 0 | 7 |
| Availability | 2 | 0 | 2 |
| Notifications | 4 | 1 | 5 |
| Chat | 0 | 7 | 7 |
| Payments | 9 | 2 | 11 |
| Reviews | 0 | 2 | 2 |
| Admin | 7 | 0 | 7 |
| **Total** | **49** | **14** | **63** |
