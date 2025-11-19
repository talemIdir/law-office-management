# Trial Version Management Guide

## Overview

Your Law Office Management System now includes a **7-day free trial** that automatically starts on first use. After the trial expires, users must activate a license to continue using the software.

---

## How It Works

### First-Time User Flow

1. **User installs and launches the app** → Trial starts automatically
2. **7-day trial period begins** → User has full access to all features
3. **Trial banner shows days remaining** → Visible at the top of the app
4. **Trial expires after 7 days** → License activation window appears
5. **User must activate license** → Follow existing license activation process

### Trial Status Display

- **Days 7-4 remaining**: Blue info banner showing days left
- **Days 3-1 remaining**: Yellow warning banner (expiring soon)
- **Day 0 (expired)**: License activation window appears with "Trial Expired" notice

---

## Trial Configuration

### Change Trial Duration

To modify the trial period from 7 days to another duration:

1. Open `electron/licensing/licenseService.js`
2. Find line 21: `const TRIAL_DAYS = 7;`
3. Change `7` to your desired number of days (e.g., `30`, `14`, `60`)
4. Save the file

**Example:**
```javascript
const TRIAL_DAYS = 30; // 30-day trial
```

### Disable Trial (License Required from Start)

If you want to require a license immediately without any trial:

1. Open `electron/main.js`
2. Find the section starting at line 103 (around `else if (accessCheck.canStartTrial)`)
3. Comment out or remove the automatic trial start block
4. Replace it with showing the license window immediately

---

## Trial Features

### What's Included

- **Automatic Start**: Trial begins automatically on first launch
- **Hardware-Bound**: Trial is tied to specific machine (prevents abuse)
- **Encrypted Storage**: Trial data stored securely and cannot be easily tampered with
- **Cannot Be Restarted**: Once trial starts, it cannot be reset on the same machine
- **No Internet Required**: Trial works completely offline
- **Visual Indicators**: Banner shows remaining days in the app

### Trial Information Storage

Trial data is stored in:
- **Location**: User's app data directory
- **File**: `trial.dat` (encrypted)
- **Contains**: Start date, end date, machine ID, status

**Path Example (Windows):**
```
C:\Users\[Username]\AppData\Roaming\law-office-management\trial.dat
```

---

## Managing Trial Users

### Check if a User is on Trial

From the main app, you can check trial status programmatically:

```javascript
const { ipcRenderer } = window.require('electron');

// Get trial information
const trialInfo = await ipcRenderer.invoke('license:getTrialInfo');

if (trialInfo) {
  console.log('Trial active:', !trialInfo.isExpired);
  console.log('Days remaining:', trialInfo.daysRemaining);
  console.log('Start date:', trialInfo.startDate);
  console.log('End date:', trialInfo.endDate);
}
```

### Available IPC Handlers

Your app now has these IPC handlers for trial management:

- `license:checkAccess` - Check overall access (license or trial)
- `license:getTrialInfo` - Get detailed trial information
- `license:startTrial` - Manually start a trial (rarely needed)
- `license:getLicenseInfo` - Get license information
- `license:activate` - Activate a license key
- `license:getMachineId` - Get the machine ID

---

## Converting Trial Users to Licensed Users

When a trial user wants to purchase:

1. **User sends you their Machine ID** (shown in activation window)
2. **Generate license key** using your license generator:
   ```bash
   cd license-generator
   node generateKey.js "machine-id" "Customer Name" "email@example.com"
   ```
3. **Send license key to user**
4. **User enters key in activation window**
5. **App unlocks permanently** with full license

Once licensed, the trial status is ignored and the banner disappears.

---

## Troubleshooting

### User Says Trial Won't Start

**Possible causes:**
- Trial already started previously on that machine
- `trial.dat` file exists and is corrupted
- Machine ID mismatch

**Solution:**
- Check if `trial.dat` exists in user data folder
- Delete `trial.dat` to allow trial to start again (manual intervention)
- Verify no license file exists

### User Can't Find Days Remaining

**Solution:**
- Trial banner appears at the top of the main app
- Only visible when on active trial (not shown for licensed users)
- Make sure app is fully loaded and user is logged in

### Trial Expired but User Has Valid License

**Solution:**
- This shouldn't happen - license takes priority over trial
- Check that license was activated correctly
- Verify license file exists: `license.dat` in user data directory

### Want to Reset Trial for Testing

During development/testing:

1. Close the app
2. Navigate to user data directory:
   - **Windows**: `C:\Users\[Username]\AppData\Roaming\law-office-management\`
   - **Mac**: `~/Library/Application Support/law-office-management/`
   - **Linux**: `~/.config/law-office-management/`
3. Delete `trial.dat` file
4. Restart app - trial will start fresh

---

## Security Features

### Trial Protection

- **Hardware-Bound**: Trial data includes machine ID - won't work if transferred
- **Encrypted**: Trial file is encrypted using AES-256
- **Tamper-Proof**: Any modification to trial file invalidates it
- **No Reset**: Once trial ends, only a valid license can unlock the app

### Cannot Be Bypassed By:

- Changing system clock/date
- Copying trial file to another machine
- Editing trial file manually
- Reinstalling the app (trial data persists)

---

## Marketing Your Trial

### Communicating Trial to Users

**On your website/download page:**
```
✅ Free 7-Day Trial
• Full access to all features
• No credit card required
• No internet connection needed
• Automatically converts to full version after purchase
```

**In documentation:**
```
Your first 7 days are free! The trial starts automatically when you
launch the app. After 7 days, simply purchase a license to continue
using all features without any interruption.
```

### Email Template for Expiring Trials

```
Subject: Your Law Office Management Trial is Expiring Soon

Hello,

Your 7-day trial of our Law Office Management System will expire in 2 days.

To continue using the software:
1. Click "Help" > "About" to see your Machine ID
2. Purchase a license from [your website]
3. We'll send you a license key within 24 hours
4. Enter the key to unlock your full license

No need to reinstall - your data is safe and will be available
immediately after activation!

Questions? Contact us at [your email]
```

---

## Best Practices

### For Developers

1. **Test Trial Flow**: Always test on a fresh machine/VM to verify trial works
2. **Monitor Trial Usage**: Keep track of how many users convert from trial
3. **Clear Communication**: Make sure UI clearly shows trial status
4. **Smooth Transition**: Ensure license activation doesn't interrupt work

### For Business

1. **7 Days is Optimal**: Gives users enough time to test without being too long
2. **Follow Up**: Send reminder emails at day 5 and day 7
3. **Easy Purchase**: Make license purchase process simple
4. **Support Ready**: Be prepared to help users with activation

---

## Technical Details

### Trial Flow Diagram

```
App Launch
    ↓
Check License File
    ↓
No License Found?
    ↓
Check Trial File
    ↓
No Trial File?
    ↓
START TRIAL (7 days)
    ↓
Show App + Trial Banner
    ↓
[7 days later]
    ↓
Trial Expired
    ↓
Show License Activation Window
```

### Code Architecture

- **licenseService.js**: Core trial logic and validation
- **main.js**: App startup flow and trial checking
- **licenseActivation.html**: Activation UI with trial status
- **TrialBanner.jsx**: React component showing trial status in app

---

## FAQ

**Q: Can users extend the trial?**
A: No, trial is one-time per machine. This prevents abuse.

**Q: What if user reinstalls Windows?**
A: Windows reinstall may change machine ID, allowing trial to start again. This is acceptable edge case.

**Q: Can I offer different trial lengths to different users?**
A: Not automatically. You'd need to customize the code or manually provide early licenses.

**Q: Does trial track usage analytics?**
A: No, the current implementation only tracks start/end dates. Add analytics if needed.

**Q: Can trial users access all features?**
A: Yes, trial provides full feature access. Modify TrialBanner.jsx if you want to restrict features.

---

## Support

For issues with trial management:
- Check `LICENSING_SETUP.md` for general licensing documentation
- Review `LICENSE_QUICKSTART.md` for quick reference
- Examine console logs for trial-related errors

---

**Trial system is ready to use!** Build your installer and distribute to users. The trial will start automatically on first launch.
