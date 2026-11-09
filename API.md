# FOODWISE API contract

The React app calls these endpoints when `VITE_API_URL` is set.
The adapter is in `src/lib/api.js`. Build the backend to match this file.

## General rules

- JSON in, JSON out. Errors return a non-2xx status with `{ "detail": "Readable message" }`.
  The app shows `detail` to the user, so write it for users.
- After login, every request sends `Authorization: Bearer <token>`.
- Data belongs to the user's household. If the user has no household yet,
  use a personal household for them so all data still has an owner.
- IDs are created by the app (short strings like `"k3j9x2a"`). Use them as primary keys.
- Allow CORS from the app's domain (and `http://localhost:5173` for development).

## Auth

### `POST /api/auth/login`
Body: `{ "name": "Loki", "email": "loki@example.com", "password": "..." }`
Returns: `{ "user": { "id": "u1", "name": "Loki", "email": "loki@example.com" }, "token": "..." }`
Create the account on first login (sign-up) or check the password.

## Data collections

Six collections share the same three endpoints:
`items`, `shop`, `meals`, `waste`, `saved`, `recipes`.

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/api/{collection}` | none | array of objects |
| PUT | `/api/{collection}/{id}` | full object | the saved object (create or replace) |
| DELETE | `/api/{collection}/{id}` | none | 204 No Content |

### Object shapes

```jsonc
// items: food at home
{ "id": "a1", "name": "Milk", "cat": "fridge|freezer|pantry", "exp": "2026-11-12",
  "qty": "1 L", "pct": 60, "em": "🥛", "added": "2026-11-06" }

// shop: shopping list
{ "id": "s1", "name": "Tofu", "done": false }

// meals: meal plan (rid = recipe id, built-in "r1".."r10" or a saved AI recipe id)
{ "id": "m1", "date": "2026-11-10", "rid": "r1" }

// waste: food thrown away
{ "id": "w1", "name": "Lettuce", "kg": 0.3, "date": "2026-11-09", "reason": "Expired" }

// saved: food used up before expiry (for impact numbers)
{ "id": "v1", "name": "Spinach", "kg": 0.3, "date": "2026-11-07" }

// recipes: AI recipes the user saved
{ "id": "aixyz", "name": "...", "em": "🥗", "min": 20, "ing": ["chicken"], "steps": ["..."], "ai": true }
```

Dates are `YYYY-MM-DD` strings.

## Household sharing

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/api/household` | none | household, or `null` if the user has none |
| POST | `/api/household` | `{ "name": "Loki’s household" }` | new household |
| POST | `/api/household/join` | `{ "code": "K7M2QP" }` | joined household |
| POST | `/api/household/leave` | none | 204 or `null` |

Household shape:
```json
{ "id": "h1", "name": "Loki’s household", "code": "K7M2QP",
  "members": [{ "id": "u1", "name": "Loki" }] }
```
Create a random 6-character code. When a user creates or joins a household,
their data moves to (or is read from) that household.

## AI (call the Claude API from the backend, never from the app)

Keep the API key on the server only.

### `POST /api/ai/scan`
Body: `multipart/form-data` with one file field `photo`.
Returns:
```json
{ "name": "Milk", "category": "fridge", "expiry_date": "2026-11-15",
  "shelf_life_days": 7, "quantity": 1, "unit": "L" }
```
`expiry_date` is `null` when no date is readable on the label; the app then uses
`shelf_life_days` and tells the user it is an estimate. `name` is `null` if no food is found.

### `POST /api/ai/recipe`
Body: `{ "items": [{ "name": "Milk", "pct": 60, "days_left": 2 }, ...] }` (soonest expiry first)
Returns:
```json
{ "name": "Veggie Omelette", "emoji": "🍳", "minutes": 15,
  "ingredients": ["egg", "milk", "tomato"], "steps": ["...", "..."] }
```
Ingredient names should be short and lowercase so the app can match them to the inventory.

## Suggested database tables

```
users        (id, name, email, password_hash, household_id)
households   (id, name, code UNIQUE)
items        (id, household_id, name, cat, exp, qty, pct, em, added)
shop         (id, household_id, name, done)
meals        (id, household_id, date, rid)
waste        (id, household_id, name, kg, date, reason)
saved        (id, household_id, name, kg, date)
recipes      (id, household_id, name, em, min, ing JSON, steps JSON)
```
