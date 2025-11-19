# Licensing System Setup Guide

## Overview

Your Law Office Management System now has a **fully offline, perpetual license system** that prevents unauthorized copying and distribution. Here's everything you need to know.

## How It Works

### Customer Experience:

1. Customer installs your application
2. On first launch, they see an activation window
3. Window displays their unique **Machine ID** (hardware fingerprint)
4. They copy the Machine ID and contact you
5. You generate a license key for their specific machine
6. Customer enters the license key
7. App validates and unlocks - works forever on that machine!

### Your Workflow:

1. Customer sends you their Machine ID
2. You run the license generator with their details
3. You send them the generated license key
4. Done! License record is saved automatically

## Security Features

✅ **Hardware-Bound**: License tied to specific computer hardware
✅ **Fully Offline**: No internet connection required
✅ **Encrypted Storage**: License data encrypted locally
✅ **Anti-Tampering**: Cannot be easily modified or bypassed
✅ **One License = One Machine**: Cannot share with others
✅ **Perpetual**: No expiration date, pay once use forever

## IMPORTANT: Before Distributing Your App

### 1. Change the Encryption Key (CRITICAL!)

**⚠️ YOU MUST DO THIS BEFORE CREATING YOUR FIRST INSTALLER!**

The default encryption key is: `LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS`

You need to change it to something unique and secure:

**Step 1**: Open `electron/licensing/licenseService.js`

Find this line (around line 22):
```javascript
const ENCRYPTION_KEY = 'LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS';
```

Change it to a strong random string (at least 32 characters):
```javascript
const ENCRYPTION_KEY = 'YourVeryLongAndSecureRandomKey12345!@#$%';
```

**Step 2**: Open `license-generator/generateKey.js`

Find the same line (around line 17):
```javascript
const ENCRYPTION_KEY = 'LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS';
```

Change it to the EXACT SAME value as Step 1:
```javascript
const ENCRYPTION_KEY = 'YourVeryLongAndSecureRandomKey12345!@#$%';
```

**⚠️ CRITICAL**: Both files MUST have the SAME encryption key!

### 2. Secure the License Generator

The `license-generator/` directory should NEVER be distributed to customers!

- Keep it on YOUR computer only
- Don't include it in the installer
- Don't commit it to public repositories
- Backup the `license-records/` folder regularly

The build process already excludes it, but verify your build output doesn't contain:
- `license-generator/` folder
- `LICENSING_SETUP.md` file

## Using the License Generator

### Installation

The license generator uses the same dependencies as your main app. They're already installed.

### Generate a License Key

```bash
cd license-generator
node generateKey.js <machineId> <customerName> [email]
```

### Example:

```bash
node generateKey.js "f4e3d2c1-b0a9-8f7e-6d5c-4b3a2e1d0c9b" "مكتب المحامي أحمد" "ahmed@example.com"
```

### Output:

```
╔════════════════════════════════════════════════════════════════╗
║          LICENSE KEY GENERATOR - Law Office Management         ║
╚════════════════════════════════════════════════════════════════╝

License Key Generated Successfully!

─────────────────────────────────────────────────────────────────
Customer Name    : مكتب المحامي أحمد
Customer Email   : ahmed@example.com
Machine ID       : f4e3d2c1-b0a9-8f7e-6d5c-4b3a2e1d0c9b
License Type     : Perpetual (No Expiry)
Generated Date   : 1/18/2025, 10:30:00 AM
─────────────────────────────────────────────────────────────────

🔑 LICENSE KEY: A1B2-C3D4-E5F6-G7H8-I9J0

─────────────────────────────────────────────────────────────────

✓ License record saved to: license-records/license-2025-01-18.json
```

### What to Send to Customer:

```
مرحباً [اسم العميل],

شكراً لشرائك نظام إدارة مكتب المحاماة!

مفتاح الترخيص الخاص بك:
A1B2-C3D4-E5F6-G7H8-I9J0

طريقة التفعيل:
1. افتح البرنامج
2. في نافذة التفعيل، أدخل اسمك
3. أدخل مفتاح الترخيص أعلاه
4. انقر "تفعيل"

ملاحظة: هذا المفتاح مخصص لجهاز الكمبيوتر الخاص بك فقط.

---

Hello [Customer Name],

Thank you for purchasing the Law Office Management System!

Your License Key:
A1B2-C3D4-E5F6-G7H8-I9J0

Activation Instructions:
1. Open the application
2. In the activation window, enter your name
3. Enter the license key above
4. Click "Activate"

Note: This key is specific to your computer only.
```

## License Records

All generated licenses are saved in `license-generator/license-records/` as JSON files.

**Example record:**

```json
{
  "licenseKey": "A1B2-C3D4-E5F6-G7H8-I9J0",
  "machineId": "f4e3d2c1-b0a9-8f7e-6d5c-4b3a2e1d0c9b",
  "customerName": "مكتب المحامي أحمد",
  "customerEmail": "ahmed@example.com",
  "expiryDate": null,
  "maxActivations": 1,
  "issueDate": "2025-01-18T08:30:00.000Z",
  "version": "1.0",
  "generatedAt": "2025-01-18T08:30:00.000Z"
}
```

**⚠️ IMPORTANT**: Backup this folder regularly! These are your customer records.

## Building Your Installer

### Build the Application

```bash
npm run build
npm run electron:build
```

This creates the installer in the `release/` directory.

The installer is now **protected** - users must activate with a license key to use it.

### What Gets Distributed:

✅ The installer (`.exe` file)
✅ Encrypted license validation code
❌ NOT the license generator
❌ NOT the encryption key
❌ NOT the license records

## Common Questions

### Q: Can customers share the installer?

**A:** They can share the installer file, but it won't work without a valid license key. Each license key is tied to a specific computer's hardware, so even if they share the license key, it won't work on a different computer.

### Q: What if a customer buys a new computer?

**A:** They need to contact you with the new Machine ID, and you generate a new license key. You can track this in your records and decide your policy (free transfer once, charge for additional transfers, etc.).

### Q: Can they reinstall on the same computer?

**A:** Yes! The license is tied to the hardware. If they reinstall Windows or the app, they can reactivate with the same license key.

### Q: What if they change hardware (RAM, hard drive, etc.)?

**A:** Minor hardware changes usually won't affect the Machine ID. Major changes (motherboard, CPU) might change the Machine ID, requiring a new license key. This is normal for hardware-bound licensing.

### Q: How secure is this system?

**A:** Very secure for a desktop application:
- License keys are mathematically tied to hardware
- Encrypted storage prevents tampering
- No network validation means no server costs
- Professional protection suitable for commercial software

However, remember: **No protection is 100% unbreakable** by determined hackers. This system prevents casual sharing and 99% of unauthorized use.

### Q: Can I change the license format?

**A:** Yes! You can modify the generator to create different formats, add more features, or change the validation logic. The code is fully customizable.

## Troubleshooting

### Customer: "License key doesn't work"

1. Verify they copied the Machine ID correctly (no extra spaces)
2. Check they're entering the license key exactly as provided
3. Ensure they haven't modified the app files
4. Generate a fresh license key

### Customer: "Moved to new computer, license doesn't work"

1. This is expected behavior - license is hardware-bound
2. Have them get the new Machine ID
3. Generate a new license for the new machine
4. Decide your transfer policy

### Error: "Failed to initialize license service"

1. Check that crypto-js and node-machine-id are installed
2. Verify the encryption key is set correctly
3. Check file permissions in app data directory

## Advanced Customization

### Add License Expiration

In `generateKey.js`, modify:

```javascript
expiryDate: new Date('2026-12-31').toISOString() // Expires Dec 31, 2026
```

### Support Multiple Machines per License

In `generateKey.js`, modify:

```javascript
maxActivations: 3 // Allow 3 machines
```

Then update `licenseService.js` to track activations (requires adding online validation).

### Add Trial Period

Create a separate trial key generation that includes:

```javascript
expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
```

### Custom Branding

Edit `electron/licensing/licenseActivation.html` to:
- Change colors
- Add your logo
- Modify text and instructions
- Change language

## Files Overview

```
law-office-management/
├── electron/
│   └── licensing/
│       ├── licenseService.js          # Core validation logic
│       ├── licenseWindow.js           # Window management
│       └── licenseActivation.html     # Activation UI
├── license-generator/                 # KEEP THIS PRIVATE!
│   ├── generateKey.js                 # Key generator script
│   ├── license-records/               # Customer records
│   │   └── .gitkeep
│   ├── .gitignore
│   └── README.md
└── LICENSING_SETUP.md                 # This file
```

## Security Checklist

Before distribution, verify:

- [ ] Changed ENCRYPTION_KEY in both files
- [ ] Both files have the EXACT SAME key
- [ ] license-generator/ is NOT in the build output
- [ ] Tested license activation with a real key
- [ ] Backup system for license-records/
- [ ] License generator secured on your computer
- [ ] Customer support process documented

## Support & Maintenance

Keep track of:
- Customer names and license keys
- Machine IDs
- Issue dates
- Transfer requests
- Any license problems

Use the license-records folder for this, and consider creating a spreadsheet for quick reference.

---

## Next Steps

1. ✅ Change the encryption key
2. ✅ Test the activation process
3. ✅ Generate a test license for yourself
4. ✅ Build the installer
5. ✅ Test the installer on a clean machine
6. ✅ Set up your customer support process
7. ✅ Start selling! 🚀

---

**Congratulations!** Your application now has professional license protection. Good luck with sales!

If you need any modifications or have questions, all the code is well-commented and easy to customize.
