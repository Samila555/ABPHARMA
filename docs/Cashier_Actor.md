# Cashier Actor & Use Cases

## Overview
The Cashier is a frontend-facing operational role responsible primarily for completing transactions with walk-in customers or processing orders via the POS system. They have limited administrative access.

## Cashier Use Cases

1. **Login**
   - Access the POS and basic administrative portal using secure credentials.

2. **Search Medicine**
   - Look up medicines in the inventory (prices, availability) without editing capabilities.

3. **Process sales (POS)**
   - Enter items into the local cart or scanner.
   
4. **Scan Barcode**
   - Use a barcode scanner to quickly add medicines to the cart.

5. **Generate invoices/receipts**
   - Provide physical or digital proof of transaction to customers.

6. **Calculate Total**
   - Automatically tally up cart contents including taxes or delivery charges.

7. **Apply Discount (if permitted)**
   - Apply specific promotional codes or manual overrides if authorization exists.

8. **Accept Payment (Cash/Card/Mobile)**
   - Complete transactions via various payment gateways.

9. **Print Receipt**
   - Interface with the local POS printer.

10. **Process Return / Refunds (optional)**
    - Re-enter returned stock and issue refunds depending on pharmacy policy.

11. **Look up customer information**
    - Refer to customer purchase history for specific medicines or contact info.

12. **View Sales History / Today's Sales**
    - View the store's transaction log for the current shift.

13. **Logout**
    - Securely close the active session.

## System Constraints & Permissions
- **Restricted Access:** Cannot edit medicine details, system settings, or inventory counts unless explicitly granted permission by an administrator.
- **Role Identifier:** `cashier` in the backend database.
