# Law Office Management System - Task List

**Project:** Algerian Law Office Management System
**Last Updated:** November 11, 2025
**Status:** Development Phase
**Version:** 1.0.0

---

## 📊 Progress Overview

- **Critical Tasks:** 4 (🔴 Must fix before deployment)
- **High Priority:** 6 (🟠 Fix within 1-2 weeks)
- **Medium Priority:** 5 (🟡 Plan for next sprint)
- **Total Estimated Effort:** 200-250 hours

---

## 🔴 CRITICAL PRIORITY (Fix Immediately)

### 1. Fix Electron Security Vulnerability ⚠️

**Priority:** CRITICAL
**Effort:** 4 hours
**Status:** ❌ Not Started

**Problem:**

- `nodeIntegration: true` - Allows renderer process to access Node.js APIs
- `contextIsolation: false` - Allows renderer to share context with preload scripts
- **Risk:** Remote Code Execution (RCE) - Any XSS vulnerability can compromise entire system
- **Severity:** 10/10

**Location:** `electron/main.js:31-34`

**Current Code:**

```javascript
webPreferences: {
  nodeIntegration: true,    // DANGEROUS!
  contextIsolation: false   // DANGEROUS!
}
```

**Required Changes:**

1. Create `electron/preload.js` to expose safe IPC APIs
2. Update `electron/main.js` webPreferences:
   ```javascript
   webPreferences: {
     nodeIntegration: false,
     contextIsolation: true,
     preload: path.join(__dirname, 'preload.js')
   }
   ```
3. Update `src/utils/api.js` to use exposed APIs from preload
4. Test all IPC communications still work

**References:**

- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)

---

### 2. Add Input Validation & Prevent SQL Injection

**Priority:** CRITICAL
**Effort:** 8 hours
**Status:** ❌ Not Started

**Problem:**

- IPC handlers accept raw `searchOptions` without validation
- No server-side validation on user inputs
- **Risk:** SQL injection, data theft, corruption
- **Severity:** 9/10

**Location:** `electron/main.js:143-150` and all IPC handlers

**Required Changes:**

1. **Create validation schemas** (`electron/validators.js`):

   ```javascript
   const clientSchema = {
     name: { type: "string", required: true, maxLength: 255 },
     phone: { type: "string", pattern: /^(05|06|07)[0-9]{8}$/ },
     email: { type: "email", optional: true },
     nationalId: { type: "string", pattern: /^[0-9]{18}$/, optional: true },
   };
   ```

2. **Whitelist search options**:

   ```javascript
   const allowedSearchFields = {
     client: ["name", "phone", "email", "status", "type"],
     case: ["caseNumber", "title", "status", "caseType"],
   };
   ```

3. **Validate all inputs** before database operations:
   - Client data (phone, email, national ID)
   - Case data (amounts, dates, case numbers)
   - Invoice data (amounts, tax rates)
   - Date ranges (start < end)
   - Numeric values (no negatives where inappropriate)

4. **Sanitize search queries** to prevent injection

**Files to Update:**

- `electron/main.js` - Add validation to all IPC handlers
- `electron/validators.js` - New file for validation schemas
- All page components - Add client-side validation too

---

### 3. Implement User Authentication & Authorization

**Priority:** CRITICAL
**Effort:** 16 hours
**Status:** ❌ Not Started

**Problem:**

- No login system despite User model existing
- Anyone with file access can use the app
- No session management
- No role-based access control (RBAC)

**Required Features:**

1. **Password Security:**
   - Install `bcrypt` for password hashing
   - Hash passwords before storing (never plain text)
   - Password strength requirements

2. **Login System:**
   - Create `src/pages/Login.jsx`
   - Login form with username/password
   - Remember me functionality
   - Session token storage (electron-store)

3. **Session Management:**
   - IPC handler for authentication: `auth:login`, `auth:logout`, `auth:checkSession`
   - JWT or session ID for maintaining state
   - Auto-logout after inactivity

4. **Role-Based Access Control:**
   - User roles: `admin`, `lawyer`, `secretary`
   - Permissions matrix:
     - Admin: Full access
     - Lawyer: View all, edit assigned cases
     - Secretary: View only, manage appointments/documents
   - Protect IPC handlers based on roles

5. **User Management UI:**
   - Create `src/pages/Users.jsx`
   - CRUD operations for users (admin only)
   - Password reset functionality

**Files to Create/Update:**

- `src/pages/Login.jsx` - New login page
- `src/pages/Users.jsx` - New user management page
- `electron/auth.js` - Authentication handlers
- `electron/database.js` - Update User model with password hashing
- `src/App.jsx` - Add protected routes
- `src/utils/auth.js` - Auth helper functions

**Dependencies to Install:**

```bash
npm install bcrypt jsonwebtoken
```

---

### 4. Add React Error Boundaries

**Priority:** CRITICAL
**Effort:** 4 hours
**Status:** ❌ Not Started

**Problem:**

- Single component crash brings down entire app
- No graceful error handling
- Poor user experience during errors

**Required Implementation:**

1. **Create Error Boundary Component** (`src/components/ErrorBoundary.jsx`):

   ```javascript
   class ErrorBoundary extends React.Component {
     state = { hasError: false, error: null };

     static getDerivedStateFromError(error) {
       return { hasError: true, error };
     }

     componentDidCatch(error, errorInfo) {
       console.error("Error caught by boundary:", error, errorInfo);
       // Optional: Send to error reporting service
     }

     render() {
       if (this.state.hasError) {
         return <ErrorFallback error={this.state.error} />;
       }
       return this.props.children;
     }
   }
   ```

2. **Create Error Fallback UI** (`src/components/ErrorFallback.jsx`):
   - User-friendly error message in Arabic
   - "Reload" button
   - "Report Problem" option
   - Contact support information

3. **Wrap App with Error Boundary** (`src/App.jsx`):
   - Wrap entire app
   - Optionally wrap individual routes

4. **Add Error Logging:**
   - Log errors to file (in production)
   - Include stack traces, user actions, timestamp

**Files to Create:**

- `src/components/ErrorBoundary.jsx`
- `src/components/ErrorFallback.jsx`

**Files to Update:**

- `src/main.jsx` - Wrap App with ErrorBoundary
- `src/App.jsx` - Add route-level error boundaries

---

## 🟠 HIGH PRIORITY (Fix Within 1-2 Weeks)

### 5. Replace Alert-Based Errors with Toast Notifications

**Priority:** HIGH
**Effort:** 12 hours
**Status:** ❌ Not Started

**Problem:**

- Using `alert()` and `confirm()` - blocks UI, poor UX
- No consistent error messaging
- Not accessible

**Current Issues:**

- `Clients.jsx:260` - `alert('خطأ: ' + result.error)`
- `Cases.jsx:268` - `if (confirm('...'))` for delete
- Multiple files use browser dialogs

**Solution:**

1. **Install Toast Library:**

   ```bash
   npm install react-toastify
   ```

2. **Create Toast Wrapper** (`src/utils/toast.js`):

   ```javascript
   import { toast } from "react-toastify";

   export const showSuccess = (message) =>
     toast.success(message, { position: "top-left" });
   export const showError = (message) =>
     toast.error(message, { position: "top-left" });
   export const showWarning = (message) =>
     toast.warning(message, { position: "top-left" });
   export const showConfirm = (message, onConfirm) => {
     // Use custom toast with action buttons
   };
   ```

3. **Replace All Alerts:**
   - Replace `alert()` with `showError()` or `showSuccess()`
   - Replace `confirm()` with custom confirmation modal
   - Add loading toasts for long operations

4. **Add Toast Container** to App.jsx with RTL support

**Files to Update:**

- All page components (Clients, Cases, CourtSessions, Documents, Invoices, Appointments, Settings)
- `src/App.jsx` - Add ToastContainer
- `src/utils/toast.js` - New utility file

---

### 6. Implement Document Upload System

**Priority:** HIGH
**Effort:** 16 hours
**Status:** ❌ Not Started

**Problem:**

- `Documents.jsx` has manual file path input - not user-friendly
- No actual file upload mechanism
- No file storage system
- `fileSize` and `mimeType` not populated

**Current State:** `Documents.jsx:131-151`

**Required Features:**

1. **File Picker Integration:**
   - Use Electron's `dialog.showOpenDialog()`
   - Support multiple file types (PDF, DOC, DOCX, images)
   - File size limits (e.g., 50MB max)

2. **File Storage:**
   - Copy uploaded files to app's userData directory
   - Organize by client/case: `documents/{clientId}/{caseId}/`
   - Generate unique filenames to prevent collisions
   - Store original filename separately

3. **IPC Handlers** (`electron/main.js`):

   ```javascript
   ipcMain.handle("document:selectFile", async () => {
     const result = await dialog.showOpenDialog({
       properties: ["openFile"],
       filters: [
         {
           name: "Documents",
           extensions: ["pdf", "doc", "docx", "jpg", "png"],
         },
       ],
     });
     return result.filePaths[0];
   });

   ipcMain.handle("document:upload", async (event, sourcePath, destPath) => {
     // Copy file to userData/documents/
     // Return file metadata (size, mimeType)
   });
   ```

4. **File Preview:**
   - PDF preview (pdf.js)
   - Image preview
   - Download button for other types

5. **File Validation:**
   - Check file exists before copying
   - Validate MIME type
   - Scan for common issues
   - Virus scanning (optional)

6. **UI Updates:**
   - Replace text input with file picker button
   - Show file preview/thumbnail
   - Display file size and type
   - Progress indicator during upload

**Files to Update:**

- `src/pages/Documents.jsx` - Replace file path input with picker
- `electron/main.js` - Add file handling IPC handlers
- `electron/fileManager.js` - New file for file operations
- `src/utils/api.js` - Add file upload methods

**Dependencies:**

```bash
npm install mime-types
```

---

### 7. Add Pagination to All Data Tables

**Priority:** HIGH
**Effort:** 8 hours
**Status:** ❌ Not Started

**Problem:**

- All queries load entire tables with `getAll()`
- Performance degrades with large datasets (100+ clients, 1000+ cases)
- No limit/offset parameters

**Required Changes:**

1. **Backend Pagination** (`electron/main.js`):

   ```javascript
   ipcMain.handle(`${modelName}:getAll`, async (event, options = {}) => {
     const page = options.page || 1;
     const limit = options.limit || 50;
     const offset = (page - 1) * limit;

     const { count, rows } = await model.findAndCountAll({
       ...options,
       limit,
       offset,
       order: options.order || [["createdAt", "DESC"]],
     });

     return {
       success: true,
       data: rows,
       pagination: {
         total: count,
         page,
         limit,
         totalPages: Math.ceil(count / limit),
       },
     };
   });
   ```

2. **Frontend Pagination Component** (`src/components/Pagination.jsx`):
   - Page numbers
   - Previous/Next buttons
   - Items per page selector (25, 50, 100)
   - Arabic RTL support

3. **Update All Page Components:**
   - Add pagination state: `const [page, setPage] = useState(1)`
   - Pass pagination params to API calls
   - Render Pagination component
   - Handle page changes

4. **Infinite Scroll Option** (Alternative for mobile-friendly UX):
   - Load more on scroll
   - "Load More" button

**Files to Create:**

- `src/components/Pagination.jsx` - Reusable pagination component

**Files to Update:**

- `electron/main.js` - Update all getAll handlers
- `src/pages/Clients.jsx`
- `src/pages/Cases.jsx`
- `src/pages/CourtSessions.jsx`
- `src/pages/Documents.jsx`
- `src/pages/Invoices.jsx`
- `src/pages/Appointments.jsx`

---

### 8. Create Reusable Modal and Form Components

**Priority:** HIGH
**Effort:** 16 hours
**Status:** ❌ Not Started

**Problem:**

- **1,500+ lines of duplicated code** across modal implementations
- Every page has nearly identical modal structure
- Maintenance nightmare - bug fixes needed in 6+ places

**Current Duplication:**

- `Clients.jsx` - ClientModal (223 lines)
- `Cases.jsx` - CaseModal (315 lines)
- `CourtSessions.jsx` - CourtSessionModal (207 lines)
- `Documents.jsx` - DocumentModal (177 lines)
- `Invoices.jsx` - InvoiceModal + PaymentModal (338 lines)
- `Appointments.jsx` - AppointmentModal (197 lines)

**Solution:**

1. **Generic Modal Component** (`src/components/Modal.jsx`):

   ```javascript
   <Modal
     isOpen={showModal}
     onClose={() => setShowModal(false)}
     title="عميل جديد"
     size="large"
   >
     {children}
   </Modal>
   ```

2. **Form Field Components** (`src/components/form/`):
   - `TextInput.jsx` - Text input with label, error, validation
   - `SelectInput.jsx` - Dropdown with options
   - `DateInput.jsx` - Date picker
   - `TextArea.jsx` - Multi-line text
   - `FileInput.jsx` - File upload
   - `CurrencyInput.jsx` - Formatted currency input

3. **Form Component** (`src/components/Form.jsx`):

   ```javascript
   <Form onSubmit={handleSubmit} validationSchema={schema}>
     <TextInput name="name" label="الاسم الكامل" required />
     <TextInput name="phone" label="رقم الهاتف" type="tel" />
     <SelectInput name="status" label="الحالة" options={statusOptions} />
   </Form>
   ```

4. **Custom Hook for CRUD** (`src/hooks/useResourceManager.js`):

   ```javascript
   const {
     items,
     loading,
     selectedItem,
     showModal,
     handleAdd,
     handleEdit,
     handleSave,
     handleDelete,
     setShowModal,
   } = useResourceManager("client");
   ```

5. **Confirmation Dialog** (`src/components/ConfirmDialog.jsx`):
   - Replaces browser `confirm()`
   - Customizable message, buttons
   - Async action support

**Files to Create:**

- `src/components/Modal.jsx`
- `src/components/ConfirmDialog.jsx`
- `src/components/Form.jsx`
- `src/components/form/TextInput.jsx`
- `src/components/form/SelectInput.jsx`
- `src/components/form/DateInput.jsx`
- `src/components/form/TextArea.jsx`
- `src/components/form/FileInput.jsx`
- `src/components/form/CurrencyInput.jsx`
- `src/hooks/useResourceManager.js`

**Files to Refactor:**

- All page components - Replace custom modals with shared components

**Expected Result:** Reduce code by ~1,000 lines

---

### 9. Add Database Indexes for Performance

**Priority:** HIGH
**Effort:** 4 hours
**Status:** ❌ Not Started

**Problem:**

- No explicit indexes on frequently queried fields
- Foreign keys not indexed
- Slow queries as data grows

**Required Indexes:**

Update `electron/database.js`:

```javascript
// Client Model
Client.init(
  {
    // ... existing fields
  },
  {
    indexes: [
      { fields: ["status"] },
      { fields: ["type"] },
      { fields: ["phone"] },
      { fields: ["email"] },
      { fields: ["createdAt"] },
    ],
  },
);

// Case Model
Case.init(
  {
    // ... existing fields
  },
  {
    indexes: [
      { fields: ["clientId"] },
      { fields: ["lawyerId"] },
      { fields: ["status"] },
      { fields: ["caseType"] },
      { fields: ["caseNumber"], unique: true },
      { fields: ["createdAt"] },
      { fields: ["clientId", "status"] }, // Composite
      { fields: ["startDate", "endDate"] },
    ],
  },
);

// CourtSession Model
CourtSession.init(
  {
    // ... existing fields
  },
  {
    indexes: [
      { fields: ["caseId"] },
      { fields: ["sessionDate"] },
      { fields: ["status"] },
      { fields: ["caseId", "sessionDate"] },
    ],
  },
);

// Invoice Model
Invoice.init(
  {
    // ... existing fields
  },
  {
    indexes: [
      { fields: ["clientId"] },
      { fields: ["caseId"] },
      { fields: ["status"] },
      { fields: ["invoiceDate"] },
      { fields: ["dueDate"] },
      { fields: ["invoiceNumber"], unique: true },
    ],
  },
);

// Payment Model
Payment.init(
  {
    // ... existing fields
  },
  {
    indexes: [
      { fields: ["invoiceId"] },
      { fields: ["paymentDate"] },
      { fields: ["paymentMethod"] },
    ],
  },
);

// Document Model
Document.init(
  {
    // ... existing fields
  },
  {
    indexes: [
      { fields: ["clientId"] },
      { fields: ["caseId"] },
      { fields: ["documentType"] },
      { fields: ["uploadDate"] },
    ],
  },
);

// Appointment Model
Appointment.init(
  {
    // ... existing fields
  },
  {
    indexes: [
      { fields: ["clientId"] },
      { fields: ["caseId"] },
      { fields: ["appointmentDate"] },
      { fields: ["status"] },
    ],
  },
);
```

**Testing:**

- Use `EXPLAIN QUERY PLAN` to verify indexes are used
- Benchmark queries before/after
- Test with large datasets (1000+ records)

**Files to Update:**

- `electron/database.js` - Add indexes to all models

---

### 10. Replace sequelize.sync() with Migration System

**Priority:** HIGH
**Effort:** 8 hours
**Status:** ❌ Not Started

**Problem:**

- Using `sequelize.sync({ alter: true })` in production
- **Risk:** Can cause data loss during schema changes
- No version control for database schema
- No rollback capability

**Current Code:** `electron/database.js:607`

**Solution:**

1. **Install Sequelize CLI:**

   ```bash
   npm install --save-dev sequelize-cli
   ```

2. **Initialize Sequelize CLI:**

   ```bash
   npx sequelize-cli init
   ```

3. **Create Initial Migration:**

   ```bash
   npx sequelize-cli migration:generate --name initial-schema
   ```

4. **Convert Models to Migration:**
   - Create `migrations/YYYYMMDDHHMMSS-initial-schema.js`
   - Include all tables, columns, indexes, constraints

5. **Update Database Initialization** (`electron/database.js`):

   ```javascript
   async function initDatabase() {
     const sequelize = new Sequelize({
       /* config */
     });

     // Run migrations instead of sync
     const umzug = new Umzug({
       migrations: {
         glob: "migrations/*.js",
       },
       context: sequelize.getQueryInterface(),
       storage: new SequelizeStorage({ sequelize }),
       logger: console,
     });

     await umzug.up(); // Run pending migrations

     return sequelize;
   }
   ```

6. **Remove sync() call:**

   ```javascript
   // REMOVE THIS:
   await sequelize.sync({ alter: true });
   ```

7. **Create Migration Script** (`package.json`):
   ```json
   "scripts": {
     "migrate": "sequelize-cli db:migrate",
     "migrate:undo": "sequelize-cli db:migrate:undo"
   }
   ```

**Future Schema Changes:**

- Always create migrations: `npx sequelize-cli migration:generate --name add-field-xyz`
- Never modify models directly in production

**Files to Update:**

- `electron/database.js` - Replace sync with migrations
- `package.json` - Add migration scripts
- Create `migrations/` folder
- Create `.sequelizerc` config file

**Dependencies:**

```bash
npm install umzug
npm install --save-dev sequelize-cli
```

---

## 🟡 MEDIUM PRIORITY (Next Sprint)

### 11. Implement Expense Management UI

**Priority:** MEDIUM
**Effort:** 12 hours
**Status:** ❌ Not Started

**Problem:**

- Expense model exists in database
- No UI component to manage expenses
- Missing from navigation
- Financial reports reference expenses but can't create them

**Required Implementation:**

1. **Create Expenses Page** (`src/pages/Expenses.jsx`):
   - List all expenses with filters (date range, category, case)
   - Add/Edit/Delete expense modal
   - Search by description/category
   - Summary cards (total expenses, by category)

2. **Expense Modal Fields:**
   - Case (dropdown from cases)
   - Category (dropdown: court fees, travel, documentation, office supplies, other)
   - Description
   - Amount (currency)
   - Expense date
   - Receipt/Document upload
   - Notes

3. **Add to Navigation** (`src/App.jsx`):

   ```javascript
   { path: '/expenses', label: 'المصروفات', icon: '💸' }
   ```

4. **Link to Cases:**
   - Show expenses in case detail view
   - Total expenses per case

5. **Financial Reports Integration:**
   - Verify reports page correctly calculates with expenses

**Files to Create:**

- `src/pages/Expenses.jsx` - New page component

**Files to Update:**

- `src/App.jsx` - Add route and navigation item

---

### 12. Add Real-Time Form Validation

**Priority:** MEDIUM
**Effort:** 12 hours
**Status:** ❌ Not Started

**Problem:**

- Validation only runs on form submit
- No real-time feedback as user types
- Poor user experience - discover all errors at once

**Required Features:**

1. **Install Validation Library:**

   ```bash
   npm install yup react-hook-form
   ```

2. **Create Validation Schemas** (`src/validation/schemas.js`):

   ```javascript
   import * as yup from "yup";

   export const clientSchema = yup.object({
     name: yup.string().required("الاسم مطلوب").min(3, "الاسم قصير جداً"),
     phone: yup
       .string()
       .required("رقم الهاتف مطلوب")
       .matches(/^(05|06|07)[0-9]{8}$/, "رقم الهاتف غير صحيح"),
     email: yup.string().email("البريد الإلكتروني غير صحيح"),
     nationalId: yup
       .string()
       .matches(/^[0-9]{18}$/, "رقم الهوية يجب أن يكون 18 رقماً"),
   });

   export const caseSchema = yup.object({
     caseNumber: yup.string().required("رقم القضية مطلوب"),
     title: yup.string().required("العنوان مطلوب"),
     amount: yup.number().min(0, "المبلغ لا يمكن أن يكون سالباً"),
     startDate: yup.date().required("تاريخ البدء مطلوب"),
     endDate: yup
       .date()
       .min(yup.ref("startDate"), "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"),
   });
   ```

3. **Integrate with Forms:**

   ```javascript
   const {
     register,
     handleSubmit,
     formState: { errors },
   } = useForm({
     resolver: yupResolver(clientSchema),
   });
   ```

4. **Show Inline Errors:**

   ```javascript
   <div className="form-group">
     <input {...register("phone")} />
     {errors.phone && <span className="error">{errors.phone.message}</span>}
   </div>
   ```

5. **Real-Time Validation:**
   - Validate on blur
   - Validate on change (with debounce)
   - Show success indicators (green checkmarks)

6. **Custom Validators:**
   - Algerian phone number format
   - National ID format (18 digits)
   - Tax ID format
   - Case number uniqueness (async)
   - Invoice number uniqueness (async)

**Files to Create:**

- `src/validation/schemas.js` - All validation schemas
- `src/validation/customValidators.js` - Custom validation functions

**Files to Update:**

- All page components with forms
- Form field components to support error display

---

### 13. Implement PDF/Excel Export Functionality

**Priority:** MEDIUM
**Effort:** 20 hours
**Status:** ❌ Not Started

**Problem:**

- Export handler is placeholder: `'Export functionality to be implemented'`
- Can't print invoices
- Can't export reports to PDF/Excel
- Can't generate case summaries

**Current State:** `electron/main.js:374-382`

**Required Features:**

1. **Install Libraries:**

   ```bash
   npm install jspdf jspdf-autotable xlsx pdfkit
   ```

2. **Invoice PDF Generation:**
   - Professional invoice template (Arabic RTL)
   - Law office letterhead
   - Client details, invoice items
   - Payment history
   - QR code for payment (optional)
   - Print and Save as PDF

3. **Report Exports:**
   - Financial report PDF (charts, tables, summary)
   - Excel export for all data tables
   - Case summary PDF
   - Client portfolio PDF

4. **IPC Handlers** (`electron/exportManager.js`):

   ```javascript
   ipcMain.handle("export:invoice", async (event, invoiceId) => {
     // Generate PDF, save to user-selected location
   });

   ipcMain.handle("export:report", async (event, reportType, data) => {
     // Generate PDF/Excel based on type
   });

   ipcMain.handle("export:caseSummary", async (event, caseId) => {
     // Generate comprehensive case PDF
   });
   ```

5. **UI Updates:**
   - Add "Export" buttons to Reports page
   - Add "Print Invoice" button to Invoices
   - Add "Export to Excel" to all tables
   - Add "Generate Case Summary" to Cases

6. **File Save Dialog:**
   - Use Electron's `dialog.showSaveDialog()`
   - Suggest filename with timestamp
   - Remember last export location

7. **Support Arabic in PDFs:**
   - Use fonts that support Arabic characters
   - RTL layout support
   - Proper text alignment

**Files to Create:**

- `electron/exportManager.js` - Export logic
- `electron/templates/invoiceTemplate.js` - Invoice PDF template
- `electron/templates/reportTemplate.js` - Report templates

**Files to Update:**

- `electron/main.js` - Replace placeholder handler
- `src/pages/Invoices.jsx` - Add print button
- `src/pages/Reports.jsx` - Add export buttons
- `src/pages/Cases.jsx` - Add case summary export

**Challenge:** Arabic font support in PDFs requires embedding fonts

---

### 14. Add Desktop Notification System

**Priority:** MEDIUM
**Effort:** 16 hours
**Status:** ❌ Not Started

**Problem:**

- `reminderSent` field exists but no sending mechanism
- No court session reminders
- No appointment notifications
- Users miss important dates

**Required Implementation:**

1. **Notification Service** (`electron/notificationService.js`):

   ```javascript
   const { Notification } = require("electron");

   function sendNotification(title, body, onClick) {
     const notification = new Notification({
       title,
       body,
       icon: path.join(__dirname, "../assets/icon.png"),
       silent: false,
     });

     notification.show();
     notification.on("click", onClick);
   }
   ```

2. **Scheduled Reminders:**
   - Background task that runs every hour
   - Check for upcoming court sessions (24h, 2h before)
   - Check for upcoming appointments (1h before)
   - Check for overdue invoices (daily)
   - Check for case deadlines

3. **IPC Handlers:**

   ```javascript
   ipcMain.handle("notification:send", async (event, notification) => {
     sendNotification(notification.title, notification.body);
   });

   ipcMain.handle("notification:schedule", async (event, notification) => {
     // Schedule future notification
   });
   ```

4. **Reminder Settings** (in Settings page):
   - Enable/disable notifications
   - Reminder timing preferences
   - Notification sound options
   - Email integration (optional)

5. **Email Integration** (Optional):
   - Install `nodemailer`
   - Configure SMTP settings
   - Send email reminders
   - Email reports to clients

6. **Update Database Records:**
   - Mark `reminderSent = true` after sending
   - Log notification history

7. **Notification Center** (Optional):
   - Show notification history in app
   - Dismiss/snooze functionality
   - Mark as read

**Files to Create:**

- `electron/notificationService.js` - Notification logic
- `electron/reminderScheduler.js` - Background scheduler
- `src/pages/Notifications.jsx` - Notification history (optional)

**Files to Update:**

- `electron/main.js` - Start reminder scheduler
- `src/pages/Settings.jsx` - Add notification settings

**Dependencies:**

```bash
npm install node-cron  # For scheduling
npm install nodemailer  # For email (optional)
```

---

### 15. Create Centralized Utility Functions

**Priority:** MEDIUM
**Effort:** 4 hours
**Status:** ❌ Not Started

**Problem:**

- `formatCurrency()` duplicated in 6+ files
- `formatDate()` duplicated in 6+ files
- Status/type translation dictionaries repeated
- Maintenance nightmare - updates needed in multiple places

**Duplicated Functions Found In:**

- `Clients.jsx`
- `Cases.jsx`
- `CourtSessions.jsx`
- `Invoices.jsx`
- `Appointments.jsx`
- `Reports.jsx`

**Solution:**

1. **Create Utility Files:**

**`src/utils/formatters.js`:**

```javascript
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ar-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPhone = (phone) => {
  if (!phone) return "-";
  return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
```

**`src/utils/constants.js`:**

```javascript
export const CLIENT_STATUS = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
};

export const CLIENT_TYPE = {
  individual: "فرد",
  company: "شركة",
  organization: "مؤسسة",
};

export const CASE_STATUS = {
  open: "مفتوحة",
  in_progress: "قيد المعالجة",
  pending: "معلقة",
  closed: "مغلقة",
  won: "كسب",
  lost: "خسارة",
  settled: "تسوية",
};

export const CASE_TYPE = {
  civil: "مدنية",
  criminal: "جنائية",
  commercial: "تجارية",
  administrative: "إدارية",
  family: "أسرة",
  labor: "عمل",
  real_estate: "عقارية",
  other: "أخرى",
};

export const COURT_TYPES = [
  "المحكمة العليا",
  "مجلس الدولة",
  "محكمة الاستئناف",
  "المحكمة الابتدائية",
  "محكمة الجنح",
  "محكمة التحقيق",
  "محكمة الأحداث",
];

export const WILAYAS = ["أدرار", "الشلف", "الأغواط" /* ... all 58 wilayas */];

export const INVOICE_STATUS = {
  draft: "مسودة",
  sent: "مرسلة",
  paid: "مدفوعة",
  partially_paid: "مدفوعة جزئياً",
  overdue: "متأخرة",
  cancelled: "ملغاة",
};

export const PAYMENT_METHODS = {
  cash: "نقداً",
  bank_transfer: "تحويل بنكي",
  check: "شيك",
  credit_card: "بطاقة ائتمان",
  other: "أخرى",
};
```

**`src/utils/validators.js`:**

```javascript
export const validatePhone = (phone) => {
  const phoneRegex = /^(05|06|07)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNationalId = (id) => {
  return /^[0-9]{18}$/.test(id);
};

export const validateDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

export const validateDateRange = (startDate, endDate) => {
  return new Date(startDate) <= new Date(endDate);
};

export const validateAmount = (amount) => {
  return !isNaN(amount) && amount >= 0;
};
```

2. **Remove Duplicates:**
   - Replace all local functions with imports
   - Search and replace across all files

3. **Update All Components:**

   ```javascript
   // Before:
   const formatCurrency = (amount) => {
     /* ... */
   };

   // After:
   import { formatCurrency } from "../utils/formatters";
   ```

**Files to Create:**

- `src/utils/formatters.js`
- `src/utils/constants.js`
- `src/utils/validators.js`

**Files to Update:**

- All page components - Replace duplicated functions with imports

**Expected Result:** Remove ~500 lines of duplicated code

---

## 📈 Summary Statistics

### Effort Breakdown

- **Critical Tasks:** 32 hours
- **High Priority:** 64 hours
- **Medium Priority:** 64 hours
- **Total:** 160 hours (~4 weeks for 1 developer)

### Risk Assessment

| Priority    | Count | Must Fix Before Production |
| ----------- | ----- | -------------------------- |
| 🔴 Critical | 4     | Yes - Security risks       |
| 🟠 High     | 6     | Yes - Core functionality   |
| 🟡 Medium   | 5     | Recommended                |

### Security Score: 3/10

**Critical vulnerabilities exist - DO NOT deploy to production**

### Code Quality Score: 6/10

**Good structure but significant improvements needed**

---

## 🚀 Recommended Implementation Order

### Phase 1: Security & Stability (Week 1)

1. Fix Electron security vulnerability ⚠️
2. Add input validation & sanitization
3. Add React error boundaries
4. Replace alerts with toast notifications

### Phase 2: Authentication & Core Features (Week 2)

5. Implement authentication system
6. Add pagination
7. Add database indexes
8. Replace sync with migrations

### Phase 3: Code Quality & Reusability (Week 3)

9. Create reusable components (Modal, Form)
10. Create centralized utilities
11. Implement document upload system
12. Add real-time form validation

### Phase 4: Extended Features (Week 4)

13. Implement expense management UI
14. Add PDF/Excel export
15. Add notification system

---

## 📝 Notes

- **Before Production:** Must complete all Critical and High priority tasks
- **Testing:** No automated tests exist - add tests as you implement features
- **Documentation:** Update README.md as features are completed
- **Backup:** Database has no backup system - consider implementing
- **Deployment:** No deployment/packaging instructions exist yet

---

## 🔗 References

- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last Review:** November 11, 2025
**Next Review:** After Phase 1 completion
