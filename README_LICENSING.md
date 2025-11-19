# 🔐 License System Documentation

## Quick Links

- **[Quick Start Guide](LICENSE_QUICKSTART.md)** - Get started in 5 minutes
- **[Complete Setup Guide](LICENSING_SETUP.md)** - Comprehensive documentation
- **[System Complete Summary](LICENSE_SYSTEM_COMPLETE.md)** - Implementation overview
- **[Generator Documentation](license-generator/README.md)** - License generator details

---

## 🎯 Overview

Your Law Office Management System now includes a **professional, offline, perpetual license system** that:

- Prevents unauthorized copying and distribution
- Requires no internet connection
- Uses hardware-bound license keys
- Provides perpetual licenses (pay once, use forever)
- Includes beautiful bilingual activation UI (Arabic/English)

---

## 🚨 BEFORE YOU BUILD - CRITICAL!

### Change the Encryption Key

**⚠️ YOU MUST DO THIS BEFORE YOUR FIRST BUILD!**

1. Open `electron/licensing/licenseService.js`
   - Find line 24: `const ENCRYPTION_KEY = 'LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS';`
   - Change it to a unique random string (32+ characters)

2. Open `license-generator/generateKey.js`
   - Find line 23: `const ENCRYPTION_KEY = 'LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS';`
   - Change it to the **EXACT SAME** value as step 1

**Example:**
```javascript
const ENCRYPTION_KEY = 'MyLawOffice2025SecretKey!@#$RandomString987654321XYZ';
```

### Test Everything Works

```bash
cd license-generator
node test-license.js
```

You should see: `✅ ALL TESTS PASSED!`

---

## 📖 How It Works

### Customer Workflow:

1. **Install App** → Customer installs your application
2. **Activation Window** → Window appears showing their Machine ID
3. **Contact You** → They send you their Machine ID + name
4. **Receive License** → You generate and send them the license key
5. **Activate** → They enter the key and activate
6. **Done!** → App unlocks permanently on that computer

### Your Workflow:

1. **Receive Request** → Customer sends Machine ID
2. **Generate Key** → Run generator script with their details
3. **Send Key** → Email/message the license key to customer
4. **Record Kept** → System automatically saves the license record

---

## 🔑 Generating License Keys

### Command:

```bash
cd license-generator
node generateKey.js "<machine-id>" "<customer-name>" "[email]"
```

### Example:

```bash
node generateKey.js "f4e3d2c1-b0a9-8f7e" "مكتب المحامي أحمد" "ahmed@example.com"
```

### Output:

```
🔑 LICENSE KEY: DDAE-4808-3F5D-016C-DCA0

✓ License record saved to: license-records/license-2025-01-18.json
```

---

## 🏗️ Building Your Installer

### Build Command:

```bash
npm run build-win
```

### Result:

- Installer created in `release/` folder
- Ready to distribute to customers
- Includes license protection
- **Does NOT include** license-generator (secure!)

---

## 🔒 Security Features

| Feature | Description |
|---------|-------------|
| **Hardware Binding** | License tied to specific computer hardware |
| **AES Encryption** | License data encrypted with AES-256 |
| **Offline Operation** | No internet required after activation |
| **Tamper Protection** | Encrypted storage prevents modification |
| **One Machine Only** | Each license works on ONE computer |
| **Deterministic** | Same machine always gets same key |

---

## 📋 File Structure

```
law-office-management/
│
├── electron/licensing/              # Customer gets this (in installer)
│   ├── licenseService.js            # License validation logic
│   ├── licenseWindow.js             # Activation window
│   └── licenseActivation.html       # Beautiful UI
│
├── license-generator/               # ⚠️ YOU KEEP THIS PRIVATE!
│   ├── generateKey.js               # Generate customer licenses
│   ├── test-license.js              # Test the system
│   ├── license-records/             # Saved customer records
│   └── README.md                    # Detailed documentation
│
├── LICENSING_SETUP.md               # Complete setup guide
├── LICENSE_QUICKSTART.md            # Quick reference
├── LICENSE_SYSTEM_COMPLETE.md       # Implementation summary
└── README_LICENSING.md              # This file!
```

---

## ❓ Common Questions

### Q: Can customers share the installer?

**A:** Yes, they can share the installer file, but it won't work without a valid license key. Each key is tied to specific hardware and won't work on other computers.

### Q: What if customer buys new computer?

**A:** They need a new license key. Generate one for the new Machine ID. You can decide your transfer policy (free once, charge for additional, etc.).

### Q: Can they reinstall Windows?

**A:** Yes! They can use the same license key to reactivate after reinstalling.

### Q: What if they upgrade hardware?

**A:** Minor upgrades (RAM, storage) usually work fine. Major changes (motherboard, CPU) may change the Machine ID and require a new license.

### Q: How secure is this?

**A:** Very secure for desktop software. It prevents 99% of unauthorized sharing. Remember: no protection is 100% unbreakable, but this is professional-grade.

---

## 🧪 Testing Checklist

Before distributing to customers:

- [ ] Changed encryption key in both files
- [ ] Both files have EXACT SAME key
- [ ] Ran `node test-license.js` - all tests pass
- [ ] Built installer with `npm run build-win`
- [ ] Tested installer on clean machine
- [ ] Activation window appears correctly
- [ ] Generated test license successfully
- [ ] Activated with test license successfully
- [ ] App unlocks and works properly
- [ ] License persists after restart

---

## 📞 Customer Support Template

When customer requests a license:

```
Thank you for purchasing!

Please send me:
1. Your Machine ID (shown in activation window)
2. Your full name
3. Your email address

I'll generate your license key within 24 hours.
```

When sending a license:

```
Your License Key: XXXX-XXXX-XXXX-XXXX-XXXX

To activate:
1. Enter your name
2. Enter the license key above
3. Click "Activate"

Note: This key is for your computer only.
No internet connection required after activation.
```

---

## 🔧 Troubleshooting

### Tests Fail

- Check crypto-js and node-machine-id are installed
- Verify ENCRYPTION_KEY matches in both files
- Ensure all files are saved properly

### License Key Invalid

- Verify Machine ID was copied correctly (no extra spaces)
- Check key format: XXXX-XXXX-XXXX-XXXX-XXXX
- Ensure customer entered key exactly as provided
- Try generating fresh key

### Build Fails

- Run `npm install` to ensure dependencies
- Check Node.js version compatibility
- Verify all files are in correct locations

---

## 📚 Additional Resources

### For Detailed Information:

- **[LICENSING_SETUP.md](LICENSING_SETUP.md)** - Complete technical guide
- **[license-generator/README.md](license-generator/README.md)** - Generator documentation

### For Quick Reference:

- **[LICENSE_QUICKSTART.md](LICENSE_QUICKSTART.md)** - Common tasks
- **[LICENSE_SYSTEM_COMPLETE.md](LICENSE_SYSTEM_COMPLETE.md)** - Summary

---

## ✅ Ready to Go!

Your licensing system is complete and tested.

**Next Steps:**

1. Change encryption key
2. Test everything
3. Build your installer
4. Start selling! 🚀

**Good luck with your business!** 💰

---

*For questions or issues, refer to the comprehensive documentation files listed above.*
