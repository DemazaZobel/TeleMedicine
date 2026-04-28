# Frontend Team Task Distribution

Now that the foundational architecture (Navigation, Auth, Provider Profile/Documents, User Settings, and Theme System) is established, we need to divide the remaining work among the team to avoid merge conflicts and maximize velocity.

Based on the `backend_endpoints.md` API specification, here is the proposed task distribution for our 3 developers.

---

## 👩‍💻 Developer 1: The Booking & Schedulng Engine (The Core)
**Focus:** Doctor discovery, slot management, and appointment bookings.

### Tasks
- [ ] **Doctor Discovery (Patient View):** Connect `GET /api/providers/search/` to a search UI. Build filtering (specialty, fee, rating).
- [ ] **Doctor Availability (Doctor View):** Build UI for doctors to set their recurring and specific day availability (wiring endpoints `FR8` and `FR9`).
- [ ] **Booking Flow (Patient View):** Build the step-by-step wizard to select a doctor, pick a slot, and confirm booking (`POST /api/appointments/`).
- [ ] **Appointment Dashboards:** Build the specific Appointment detail screens for both Doctors and Patients (viewing upcoming, past, cancelled).
- [ ] **Status Management (Doctor View):** Allow doctors to accept/reject pending appointments (`PUT /api/appointments/{id}/status/`).

---

## 👨‍💻 Developer 2: Medical Records & Clinical Tools
**Focus:** Patient medical history, prescriptions, notes, and profile completeness.

### Tasks
- [ ] **Patient Profile / Medical Info:** Build the UI for patients to fill out their medical history, allergies, and emergency contacts (`GET/PUT /api/patients/me/medical-info/`).
- [ ] **Doctor's Patient List (Doctor View):** Build the "Patients" tab UI, fetching the list of patients the doctor has interacted with (`GET /api/appointments/patients/`).
- [ ] **Clinical Notes & Prescriptions:** Build the interface for doctors during/after an appointment to write clinical notes and issue prescriptions (`POST /api/appointments/{id}/prescriptions/`).
- [ ] **Patient Record View (Patient View):** Build the dashboard where patients can see their own prescriptions and doctor notes.

---

## 🧑‍💻 Developer 3: Engagement & Operations (Chat, Reviews, Notifications)
**Focus:** Real-time features, feedback loop, and system notifications.

### Tasks
- [ ] **Chat System:** Build the Chat inbox and individual messaging interfaces for Doctor-Patient communication (`GET /api/chat/rooms/`, `POST /api/chat/messages/`). *Coordinate with backend on WebSockets if applicable.*
- [ ] **Review System (Patient View):** Build the UI for patients to leave a rating and review after a completed appointment (`POST /api/reviews/`).
- [ ] **Review Dashboard (Doctor View):** Build the UI for doctors to see their received reviews and average rating (`GET /api/reviews/provider/`).
- [ ] **Notifications:** Build a global notification tray accessing `GET /api/notifications/` and mark-as-read functionality.
- [ ] **Payments integration (Future):** Placeholder for Stripe/Chapa integration when the `POST /api/payments/initialize/` endpoint is ready.

---

## 🤝 Rules of Engagement
1. **Never block each other:** All UI work should be mocked first if the backend endpoint isn't ready. Use the TypeScript interfaces (`src/types/models.ts`) to create dummy data that exactly matches the expected API response.
2. **Use the Design System:** Read `docs/design-system.md` carefully. Ensure all new UI looks identical to the current premium styling.
3. **Daily Syncs:** Align on shared types (e.g., if Dev 1 touches `Appointment`, Dev 2 interacting with clinical notes linked to an appointment needs to know).
