```
Status: awaiting approval
# 02 Booking
Goal:        Let a customer book a slot in under 1 minute.
Users:       Customer, Admin
Flow:
  1. Customer picks a service
  2. Picks date and time
  3. Confirms and pays
  E1. Slot taken meanwhile -> shown "not available", picks another
Rules:
  R1. A slot can't be double-booked
  R2. Cancel allowed up to 24h before start
Screens:     Service list, Calendar, Confirm  (docs/design/wireframes/calendar.html)
Data:        Booking(id, customer, service, start, status)
Acceptance checks:
  - R1: Given a booked slot, when another user tries it, then they see "not available"
  - R2: Given a booking 25h away, when I cancel, then it is cancelled and the slot is free
Non-functional: page loads under 2s on 4G; works on mobile
Out of scope: recurring bookings
Open questions: (none)
Assumptions:  timezone = business timezone (Q9 default)
```
