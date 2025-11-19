# License System - Quick Start Guide

## 🎯 For You (The Vendor)

### Before First Build - Change Encryption Key!

**⚠️ CRITICAL: Do this BEFORE building your first installer!**

1. Open `electron/licensing/licenseService.js` (line 22)
2. Open `license-generator/generateKey.js` (line 17)
3. Change `ENCRYPTION_KEY` in BOTH files to the SAME random string
4. Example: `const ENCRYPTION_KEY = 'MySecretKey2025!@#$RandomString987654321';`

### Generate a License Key for a Customer

```bash
cd license-generator
node generateKey.js "customer-machine-id" "Customer Name" "email@example.com"
```

The script will output the license key and save a record automatically.

### Build Your Protected Installer

```bash
npm run build-win
```

The installer will be in the `release/` folder. It's now protected!

---

## 👥 For Your Customers

### How to Get Your Machine ID

1. Install and run the application
2. An activation window will appear
3. Copy the **Machine ID** shown
4. Send it to the vendor with your name

### How to Activate

1. Get your license key from the vendor
2. Enter your name
3. Enter the license key (format: XXXX-XXXX-XXXX-XXXX-XXXX)
4. Click "Activate"
5. Done! The app is now unlocked forever

---

## 🔒 How It Works

- Each license is tied to **one specific computer**
- **No internet required** for activation or use
- **Perpetual license** - pay once, use forever
- **Cannot be shared** - won't work on other computers
- **Secure** - encrypted and tamper-proof

---

## ❓ FAQ

**Q: Can I transfer to a new computer?**
A: Contact the vendor for a new license key for the new machine.

**Q: What if I reinstall Windows?**
A: You can reactivate with the same license key - it's tied to hardware, not Windows.

**Q: Can I share the license with a colleague?**
A: No, each license is hardware-bound and works only on one specific computer.

**Q: What happens if I change hardware?**
A: Minor changes (RAM, hard drive) usually work. Major changes (motherboard) require a new license.

---

## 📞 Support

For licensing issues, contact: [Your Contact Information]

For technical support, check: [Your Support Website/Email]
