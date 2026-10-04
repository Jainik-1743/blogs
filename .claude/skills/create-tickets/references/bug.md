```
Title:       [Booking] Double booking possible when two users click at once
Type:        Bug            Severity: Critical | High | Medium | Low
Steps:       1. Open same slot in 2 browsers  2. Confirm both
Expected:    second user sees "not available"
Actual:      both bookings are saved
Environment: staging, Chrome 129, commit abc123
Evidence:    screenshot path / log excerpt / response body
Regression test: tests/booking/double-booking.test.ts
```
