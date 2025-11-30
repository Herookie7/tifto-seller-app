# Tifto Seller App

The Tifto seller console is a React Native (Expo) application that allows store operators to manage availability, review orders, chat with customers, monitor earnings, and request withdrawals. It consumes the `tifto-backend` NestJS GraphQL API exclusively.

---

## Prerequisites

- Node.js ≥ 18.x, npm ≥ 9.x
- Expo CLI (`npm install --global expo-cli`) or `npx expo`
- A running instance of `tifto-backend` with migrations applied  
  (`npm run db:migrate:deploy && npm run start:dev`)
- Optional: Android Studio / Xcode simulators or a device with Expo Go

---

## Environment Configuration

All runtime configuration lives in `environment.ts`. Defaults target the live backend:

```ts
const LOCAL_GRAPHQL = "https://ftifto-backend.onrender.com/graphql";
const LOCAL_WS_GRAPHQL = "wss://ftifto-backend.onrender.com/graphql";
```

If your backend runs on another host/port, update `LOCAL_GRAPHQL` and `LOCAL_WS_GRAPHQL`.  
When testing Expo push notifications, ensure your Expo project ID is available to the app.

### Seller Credentials

The seller login flow authenticates with the backend’s `restaurantLogin` mutation.  
Set fallback credentials via `DEFAULT_SELLER_USERNAME` / `DEFAULT_SELLER_PASSWORD` in the backend `.env` or create real seller accounts through the admin tooling.

---

## Install & Run

```bash
# inside tifto-seller-app
npm install

# start Metro / Expo
npm run start
```

Choose the relevant runtime from the Metro prompt (Expo Go, iOS simulator, Android emulator, web).

---

## Backend GraphQL Operations Used

- **Auth**: `restaurantLogin`, `lastOrderCreds`, `sendOtpToEmail`, `sendOtpToPhoneNumber`
- **Profile**: `restaurant` (wallet totals, bank details, availability, schedule)
- **Orders**: `restaurantOrders`, `acceptOrder`, `cancelOrder`, `orderPickedUp`, `assignOrder`, `updateOrderStatusRider`, `muteRing`
- **Chat**: `chat`, `sendChatMessage`, `subscriptionNewMessage`
- **Store Management**: `toggleStoreAvailability`, `updateTimings`, `updateRestaurantBussinessDetails`
- **Earnings**: `earnings`, `storeEarningsGraph`, `transactionHistory`
- **Withdrawals**: `createWithdrawRequest`, `storeCurrentWithdrawRequest`
- **Subscriptions**: `subscribePlaceOrder`, `subscriptionNewMessage`

---

## Manual Verification Checklist

1. **Authentication**
   - Login with `restaurantLogin` (ensure Expo push token uploads if available).
   - Confirm `lastOrderCreds` pre-fills saved credentials after a successful session.

2. **Dashboard**
   - Toggle availability; check UI + GraphQL response (`toggleStoreAvailability`).
   - Verify wallet totals and bank information populate from `restaurant`.

3. **Work Schedule**
   - Edit lunch/dinner slots and save (`updateTimings`).
   - Ensure values rehydrate on refresh and in the backend.

4. **Orders**
   - Inspect new/pending/processing/delivered tabs (`restaurantOrders`).
   - Accept/cancel/pick up/assign orders and observe status transitions.
   - Validate the live order stream (`subscribePlaceOrder`).

5. **Chat**
   - Open an order chat, exchange messages, and confirm real-time updates (`subscriptionNewMessage`).

6. **Financials**
   - Review earnings summary (`earnings`) and graph filters (`storeEarningsGraph`).
   - Inspect wallet transactions (`transactionHistory`).
   - Create a withdraw request and confirm pending state (`createWithdrawRequest`, `storeCurrentWithdrawRequest`).

7. **Logout / Reauth**
   - Sign out, restart the app, and confirm saved credentials appear when configured.

---

## Troubleshooting

- **Network errors**  
  Ensure the device/emulator can reach your backend host and that CORS/network policies allow it. Update `environment.ts` if the backend URL changes.

- **GraphQL schema mismatches**  
  Run `npm run build` in `tifto-backend` to ensure the schema compiles. Re-apply migrations if new models were added.

- **Push notifications**  
  Provide an Expo project ID and test with an actual device. The backend stores notification tokens via `restaurantLogin`.

For further backend details, see `../tifto-backend/README.md`.

---

## Building APK

### Option 1: GitHub Actions (Recommended)

The easiest way to build an APK is using GitHub Actions workflows:

1. **Build APK Only**
   - Go to **Actions** tab in GitHub
   - Select **"Build Android APK"** workflow
   - Click **"Run workflow"**
   - Download the APK from the **Artifacts** section after completion

2. **Build APK and Create Release**
   - Go to **Actions** tab in GitHub
   - Select **"Build APK and Create Release"** workflow
   - Click **"Run workflow"**
   - Fill in tag name (e.g., `v1.0.62`) and release details
   - The APK will be attached to a new GitHub Release

📖 **Full documentation:** See [`.github/GITHUB_WORKFLOWS_README.md`](.github/GITHUB_WORKFLOWS_README.md)

### Option 2: Local Build

For local builds, see [`BUILD_APK_INSTRUCTIONS.md`](BUILD_APK_INSTRUCTIONS.md)

---
