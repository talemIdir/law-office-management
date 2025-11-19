# License Key Generator

## Overview

This directory contains the license key generator utility for the Law Office Management System. This tool is used to generate license keys for your customers.

**⚠️ IMPORTANT: Keep this directory SECRET and SECURE! Never share it with customers!**

## How the Licensing System Works

### For Customers (Lawyers):

1. **First Launch**: When they first run the application, they see a license activation window
2. **Machine ID Display**: The window shows their unique Machine ID (hardware fingerprint)
3. **Request License**: They send you their Machine ID along with their name
4. **Activation**: You generate a license key and send it to them
5. **Enter Key**: They enter the license key in the activation window
6. **Validation**: The system validates the key against their machine
7. **Success**: If valid, the app unlocks and they can use it forever (perpetual license)

### For You (Vendor):

1. **Receive Request**: Customer sends you their Machine ID
2. **Generate Key**: Run the generator script with their details
3. **Send Key**: Send the generated license key to the customer
4. **Keep Records**: The system automatically saves license records

## Security Features

- **Hardware Binding**: Each license is tied to a specific computer's hardware ID
- **Offline Validation**: No internet connection required after activation
- **Encryption**: License data is encrypted and stored securely
- **Anti-Tampering**: Cannot be easily copied or modified
- **One Machine = One License**: License works only on the machine it was generated for

## Usage

### Generating a License Key

```bash
cd license-generator
node generateKey.js <machineId> <customerName> [customerEmail]
```

### Example:

```bash
node generateKey.js "9f4c3a2b-8e7d-6c5b-4a3e-2d1c0b9a8f7e" "المحامي أحمد" "ahmed@lawfirm.com"
```

### Output Example:

```
╔════════════════════════════════════════════════════════════════╗
║          LICENSE KEY GENERATOR - Law Office Management         ║
╚════════════════════════════════════════════════════════════════╝

License Key Generated Successfully!

─────────────────────────────────────────────────────────────────
Customer Name    : المحامي أحمد
Customer Email   : ahmed@lawfirm.com
Machine ID       : 9f4c3a2b-8e7d-6c5b-4a3e-2d1c0b9a8f7e
License Type     : Perpetual (No Expiry)
Generated Date   : 1/18/2025, 10:30:00 AM
─────────────────────────────────────────────────────────────────

🔑 LICENSE KEY: A1B2-C3D4-E5F6-G7H8-I9J0

─────────────────────────────────────────────────────────────────

✓ License record saved to: license-records/license-2025-01-18T08-30-00.json
```

## License Records

All generated licenses are automatically saved in the `license-records/` directory. Each record contains:

- License key
- Machine ID
- Customer name
- Customer email
- Issue date
- License type

**Keep these records safe!** They help you:
- Track who has licenses
- Provide support
- Handle license transfers (if needed)
- Verify legitimate customers

## Important Security Notes

### DO:
✅ Keep this directory on YOUR computer only
✅ Backup the license-records folder regularly
✅ Change the ENCRYPTION_KEY before deploying
✅ Keep the ENCRYPTION_KEY secret and secure
✅ Store license records safely

### DON'T:
❌ Share generateKey.js with anyone
❌ Include this directory in customer installers
❌ Commit the ENCRYPTION_KEY to public repositories
❌ Share the encryption key with customers
❌ Store license records in public locations

## Changing the Encryption Key

**IMPORTANT**: Before distributing your app, you MUST change the encryption key!

1. Open `generateKey.js`
2. Change this line:
   ```javascript
   const ENCRYPTION_KEY = 'LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS';
   ```
3. Use a strong, random string (at least 32 characters)
4. Update the SAME key in `electron/licensing/licenseService.js`
5. Keep it SECRET!

**⚠️ WARNING**: If you change the encryption key after issuing licenses, all existing licenses will become invalid!

## Troubleshooting

### Customer Says License Key Doesn't Work

1. **Verify Machine ID**: Make sure they sent the correct Machine ID
2. **Check Format**: Ensure license key is in correct format (XXXX-XXXX-XXXX-XXXX-XXXX)
3. **Regenerate**: Try generating a new key with their exact Machine ID
4. **Check Encryption Key**: Ensure both generator and app use the same encryption key

### How to Transfer License to New Computer

If a customer needs to move to a new computer:

1. They run the app on the new computer
2. They get the new Machine ID
3. They send you the new Machine ID
4. You generate a NEW license key for the new machine
5. You can deactivate the old license (manually track this)

## License Types

Currently, the system generates **Perpetual Licenses** (no expiration). You can modify the generator to support:

- Trial licenses (with expiry date)
- Subscription licenses (yearly renewal)
- Multi-machine licenses (change maxActivations)

To add an expiry date, modify the generator call:

```javascript
expiryDate: new Date('2026-01-01').toISOString() // Expires Jan 1, 2026
```

## Support

If you need to modify the licensing system or add features, check these files:

- `electron/licensing/licenseService.js` - Core license validation logic
- `electron/licensing/licenseWindow.js` - License window creation
- `electron/licensing/licenseActivation.html` - Activation UI
- `license-generator/generateKey.js` - This generator script

## Best Practices

1. **Keep detailed records**: Always save customer information
2. **Use consistent naming**: Help identify customers easily
3. **Backup everything**: License records are important
4. **Test licenses**: Generate a test license and verify it works
5. **Document issues**: Keep notes about any license problems

---

**Remember**: This licensing system is your protection against unauthorized distribution. Keep it secure!
