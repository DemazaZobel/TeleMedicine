# MedLink Backend API Endpoint Specification

Comprehensive mapping of every API endpoint required to fulfill **FR1–FR27**.
Endpoints marked ✅ are already implemented. All others are **needed**.

---

## 1. Authentication (`accounts` app) — FR1, FR4, FR26

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | POST | `/api/auth/register/` | Register patient or doctor | FR1 |
| ✅ | POST | `/api/auth/login/` | Email + password login, returns JWT pair | FR1 |
| ✅ | POST | `/api/auth/verify-email/` | Verify email with OTP code | FR1 |
| ✅ | POST | `/api/auth/token/refresh/` | Refresh access token | FR1 |
| ✅ | POST | `/api/auth/password/reset/` | Request password reset email/OTP | FR4 |
| ✅ | POST | `/api/auth/password/reset/confirm/` | Confirm new password with code | FR4 |
| 🔲 | POST | `/api/auth/logout/` | Blacklist refresh token on logout | FR1 |
| 🔲 | PUT | `/api/auth/password/change/` | Change password (authenticated) | FR4 |

---

## 2. User Profiles (`accounts` app) — FR3, FR4

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | GET | `/api/users/me/` | Get current user profile | FR3, FR4 |
| 🔲 | PUT | `/api/users/me/` | Update current user profile (name, phone, avatar) | FR3, FR4 |
| 🔲 | GET | `/api/users/me/medical-info/` | Get patient medical info (blood type, allergies, conditions) | FR3 |
| 🔲 | PUT | `/api/users/me/medical-info/` | Update patient medical info | FR3 |

---

## 3. Provider / Doctor (`providers` app) — FR2, FR7, FR17

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| ✅ | GET | `/api/providers/profile/` | Get doctor's own profile (auto-creates) | FR2 |
| ✅ | PUT | `/api/providers/profile/` | Update specialization, experience, fee | FR2 |
| ✅ | POST | `/api/providers/documents/` | Upload verification document (multipart) | FR2 |
| ✅ | GET | `/api/providers/documents/list/` | List own uploaded documents | FR2 |
| 🔲 | GET | `/api/providers/availability/` | Get doctor's availability slots | FR7, FR8 |
| 🔲 | PUT | `/api/providers/availability/` | Set/update availability schedule | FR7, FR8 |

---

## 4. Doctor Discovery (`providers` app, public) — FR5, FR6, FR7, FR17, FR21

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | GET | `/api/providers/search/` | Search verified doctors (query, filters) | FR5, FR6 |
| | | | Params: `?specialization=&min_fee=&max_fee=&min_rating=&sort_by=fee,rating,distance&lat=&lng=` | |
| 🔲 | GET | `/api/providers/{id}/` | Get public doctor detail (bio, experience, ratings, availability, fee) | FR7, FR17 |
| 🔲 | GET | `/api/providers/{id}/reviews/` | List reviews for a specific doctor | FR21 |

---

## 5. Appointments / Consultations — FR8, FR9, FR10, FR11

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | POST | `/api/appointments/` | Patient creates appointment request (doctor_id, date, time, type: online/in-person) | FR8 |
| 🔲 | GET | `/api/appointments/` | List own appointments (patient or doctor) | FR8, FR9 |
| 🔲 | GET | `/api/appointments/{id}/` | Get appointment detail | FR10 |
| 🔲 | PATCH | `/api/appointments/{id}/` | Doctor: accept/reject/reschedule. System: complete/cancel | FR9, FR10 |
| 🔲 | POST | `/api/appointments/{id}/cancel/` | Cancel an appointment (either party) | FR10 |
| 🔲 | POST | `/api/appointments/{id}/complete/` | Mark consultation as completed | FR10 |

---

## 6. Notifications — FR11

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | GET | `/api/notifications/` | List user notifications (paginated) | FR11 |
| 🔲 | PATCH | `/api/notifications/{id}/read/` | Mark notification as read | FR11 |
| 🔲 | POST | `/api/notifications/register-device/` | Register push token (Expo/FCM) | FR11 |

---

## 7. Chat / Messaging — FR12, FR13, FR14, FR15

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

## 8. Payments (`payments` app) — FR16, FR17, FR18, FR19

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | POST | `/api/payments/initialize/` | Initialize Chapa payment for an appointment | FR16 |
| 🔲 | GET | `/api/payments/verify/{tx_ref}/` | Verify Chapa payment callback | FR16 |
| 🔲 | GET | `/api/payments/history/` | Payment history for current user | FR16, FR17 |
| 🔲 | GET | `/api/payments/{id}/receipt/` | Download PDF/email receipt for a payment | FR18 |
| 🔲 | GET | `/api/payments/wallet/` | Doctor wallet balance and payout history | FR19 |
| 🔲 | POST | `/api/payments/wallet/withdraw/` | Doctor requests withdrawal of earnings | FR19 |

---

## 9. Reviews & Ratings — FR20, FR21

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | POST | `/api/reviews/` | Patient submits review (1–5 stars + comment, linked to appointment) | FR20 |
| 🔲 | GET | `/api/reviews/?doctor_id={id}` | List reviews for a doctor (public, paginated) | FR20, FR21 |

---

## 10. Admin Management — FR22, FR23, FR24, FR25

> [!NOTE]
> Admin endpoints are primarily Django Admin panel + DRF admin-restricted views.

| Status | Method | Endpoint | Description | FR |
|--------|--------|----------|-------------|-----|
| 🔲 | GET | `/api/admin/doctors/` | List all doctors with verification status | FR22 |
| 🔲 | PATCH | `/api/admin/doctors/{id}/verify/` | Approve or reject a doctor's profile | FR22 |
| 🔲 | GET | `/api/admin/users/` | List/search all users | FR23 |
| 🔲 | PATCH | `/api/admin/users/{id}/` | Update user status (suspend/deactivate) | FR24 |
| 🔲 | GET | `/api/admin/consultations/` | List all consultations | FR23 |
| 🔲 | GET | `/api/admin/payments/` | List all payments | FR23 |
| 🔲 | GET | `/api/admin/analytics/` | Dashboard metrics (user count, revenue, active doctors, etc.) | FR25 |

---

## 11. System / Security — FR26, FR27

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
| Auth | 6 | 2 | 8 |
| User Profiles | 0 | 4 | 4 |
| Provider (Doctor) | 4 | 2 | 6 |
| Doctor Discovery | 0 | 3 | 3 |
| Appointments | 0 | 6 | 6 |
| Notifications | 0 | 3 | 3 |
| Chat | 0 | 7 | 7 |
| Payments | 0 | 6 | 6 |
| Reviews | 0 | 2 | 2 |
| Admin | 0 | 7 | 7 |
| **Total** | **10** | **42** | **52** |
