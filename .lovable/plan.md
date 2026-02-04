
# Plan: Add FechaSalida to registro-asignar Webhook

## Summary
Add the `fechaSalida` field to the data payload sent to the `registro-asignar` webhook, enabling n8n to identify which specific trip the driver assignment belongs to.

---

## Change Required

### File: `src/components/RegistrationTable.tsx`

**Location:** Lines 182-190 (webhook call in `handleDriverAssignment`)

**Current code:**
```typescript
const { error } = await supabase.functions.invoke("webhook-proxy", {
  body: {
    action: "registro-asignar",
    data: {
      passengerRut: passenger.rut,
      driverRut: driver?.rut || "",
    },
  },
});
```

**Updated code:**
```typescript
const { error } = await supabase.functions.invoke("webhook-proxy", {
  body: {
    action: "registro-asignar",
    data: {
      passengerRut: passenger.rut,
      driverRut: driver?.rut || "",
      fechaSalida: passenger.fechaSalida || "",
    },
  },
});
```

---

## Technical Details

| Field | Source | Purpose |
|-------|--------|---------|
| `passengerRut` | `passenger.rut` | Identifies the passenger |
| `driverRut` | `driver?.rut` or `""` | Assigns driver or clears assignment |
| `fechaSalida` | `passenger.fechaSalida` | Identifies which trip date this assignment is for |

---

## Result
The n8n webhook will now receive the trip date along with the RUT fields, allowing it to correctly update the assignment for a specific trip date in Airtable.
