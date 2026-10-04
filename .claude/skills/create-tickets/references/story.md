```
Title:       [Booking] Customer can book a free time slot
Type:        Story          Epic: Booking          Size: M
User story:  As a customer, I want to book a slot, so that I don't have to call.
Links:       FRD docs/frd/02-booking.md (R1, F1) · Wireframe: docs/design/wireframes/calendar.html
Acceptance checks:
  - [ ] Given a free slot, when I confirm, then the booking is saved
  - [ ] Given a taken slot, when I try it, then I see "not available"
UI notes:    use Calendar component; show loading and empty states
Tech notes:  POST /bookings; lock slot row while saving
Depends on:  PROJ-12 (services list)
Out of scope: payment (PROJ-20)
Done when:   checks pass, tests added, reviewed, tested by tester, docs updated
Labels:      frontend, backend
Status:      todo
```
