; Custom NSIS script for Law Office Management installer
; Adds a custom page to select data directory

!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "MUI2.nsh"

; Variables to store user input
Var Dialog
Var Label
Var DataDirText
Var DataDir
Var BrowseButton
Var InfoLabel

; Ensure the installer respects the custom installation directory
!macro customInit
  ; Initialize default data directory
  StrCpy $DataDirText "$DOCUMENTS\Law Office Management Data"
!macroend

; Add custom page to installer - this macro is called by electron-builder
!macro customInstall
  ; This macro runs during installation (after files are copied)
  Call CreateDataDirectory
  Call WriteDataPathConfig
  Call CreateShortcuts
!macroend

; Custom function to create shortcuts
Function CreateShortcuts
  ; Set shell context to current user
  SetShellVarContext current

  ; Create desktop shortcut
  CreateShortcut "$DESKTOP\Law Office Management.lnk" "$INSTDIR\Law Office Management.exe" "" "$INSTDIR\Law Office Management.exe" 0 SW_SHOWNORMAL "" "Law Office Management System"

  ; Create start menu shortcut
  CreateDirectory "$SMPROGRAMS\Law Office Management"
  CreateShortcut "$SMPROGRAMS\Law Office Management\Law Office Management.lnk" "$INSTDIR\Law Office Management.exe" "" "$INSTDIR\Law Office Management.exe" 0 SW_SHOWNORMAL "" "Law Office Management System"
  CreateShortcut "$SMPROGRAMS\Law Office Management\Uninstall Law Office Management.lnk" "$INSTDIR\Uninstall Law Office Management.exe" "" "$INSTDIR\Uninstall Law Office Management.exe" 0 SW_SHOWNORMAL "" "Uninstall Law Office Management"
FunctionEnd

; Add the custom page after the directory page
!macro customPageAfterChangeDir
  Page custom DataDirectoryPage DataDirectoryPageLeave
!macroend

; Custom page function for data directory selection
Function DataDirectoryPage
  nsDialogs::Create 1018
  Pop $Dialog

  ${If} $Dialog == error
    Abort
  ${EndIf}

  ; Title
  ${NSD_CreateLabel} 0 0 100% 12u "اختيار مجلد البيانات"
  Pop $Label

  ; Set bold font for title
  CreateFont $0 "$(^Font)" 10 700
  SendMessage $Label ${WM_SETFONT} $0 0

  ; Instructions
  ${NSD_CreateLabel} 0 20u 100% 36u "الرجاء تحديد المكان الذي تريد تخزين بيانات مكتب المحاماة فيه، بما في ذلك قاعدة البيانات والمستندات والنسخ الاحتياطية.$\r$\n$\r$\nمهم: اختر موقعًا يتم نسخه احتياطيًا بانتظام لمنع فقدان البيانات."
  Pop $InfoLabel

  ; Data Directory Label
  ${NSD_CreateLabel} 0 62u 100% 12u "مجلد البيانات:"
  Pop $Label

  ; Data Directory Text Box
  ${NSD_CreateText} 0 75u 80% 12u "$DataDirText"
  Pop $DataDir

  ; Browse Button
  ${NSD_CreateButton} 82% 75u 18% 12u "استعراض..."
  Pop $BrowseButton
  ${NSD_OnClick} $BrowseButton BrowseForDirectory

  ; Additional Info
  ${NSD_CreateLabel} 0 95u 100% 24u "سيحتوي هذا المجلد على:$\r$\n  • قاعدة بيانات SQLite (law-office.db)$\r$\n  • المستندات والملفات المرفوعة$\r$\n  • إعدادات التطبيق"
  Pop $Label

  nsDialogs::Show
FunctionEnd

; Browse button click handler
Function BrowseForDirectory
  nsDialogs::SelectFolderDialog "اختر مجلد البيانات" "$DataDirText"
  Pop $0

  ${If} $0 != error
    StrCpy $DataDirText $0
    ${NSD_SetText} $DataDir "$DataDirText"
  ${EndIf}
FunctionEnd

; Leave function to validate and save data
Function DataDirectoryPageLeave
  ; Get the selected directory
  ${NSD_GetText} $DataDir $DataDirText

  ; Validate that a directory was selected
  ${If} $DataDirText == ""
    MessageBox MB_OK|MB_ICONEXCLAMATION "الرجاء تحديد مجلد البيانات."
    Abort
  ${EndIf}
FunctionEnd

; Function to create the data directory
Function CreateDataDirectory
  ; Create the data directory if it doesn't exist
  CreateDirectory "$DataDirText"

  ; Create subdirectories
  CreateDirectory "$DataDirText\documents"
  CreateDirectory "$DataDirText\backups"

  ; Write a readme file
  FileOpen $1 "$DataDirText\README.txt" w
  FileWrite $1 "نظام إدارة مكتب المحاماة - مجلد البيانات$\r$\n"
  FileWrite $1 "============================================$\r$\n$\r$\n"
  FileWrite $1 "يحتوي هذا المجلد على جميع بيانات نظام إدارة مكتب المحاماة الخاص بك.$\r$\n$\r$\n"
  FileWrite $1 "مهم:$\r$\n"
  FileWrite $1 "- قم بعمل نسخة احتياطية من هذا المجلد بالكامل بانتظام لمنع فقدان البيانات$\r$\n"
  FileWrite $1 "- لا تقم بتعديل ملفات قاعدة البيانات يدوياً$\r$\n"
  FileWrite $1 "- حافظ على أمان هذا المجلد لأنه يحتوي على معلومات سرية عن العملاء$\r$\n$\r$\n"
  FileWrite $1 "هيكل المجلد:$\r$\n"
  FileWrite $1 "- law-office.db: ملف قاعدة البيانات الرئيسي$\r$\n"
  FileWrite $1 "- documents/: المستندات والملفات المرفوعة$\r$\n"
  FileWrite $1 "- backups/: ملفات النسخ الاحتياطي لقاعدة البيانات$\r$\n"
  FileClose $1
FunctionEnd

; Function to write data path configuration
Function WriteDataPathConfig
  ; Get the app data directory for config
  SetShellVarContext current
  StrCpy $0 "$APPDATA\law-office-management"

  ; Create directory if it doesn't exist
  CreateDirectory "$0"

  ; Write the config file with data path
  FileOpen $1 "$0\data-path.txt" w
  FileWrite $1 "$DataDirText"
  FileClose $1

  ; Also write installation info
  FileOpen $1 "$0\install-info.txt" w
  FileWrite $1 "Installation Directory: $INSTDIR$\r$\n"
  FileWrite $1 "Data Directory: $DataDirText$\r$\n"
  FileWrite $1 "Install Date: ${__DATE__} ${__TIME__}$\r$\n"
  FileClose $1
FunctionEnd

; Custom uninstaller macro to clean up shortcuts
!macro customUnInstall
  ; Set shell context to current user
  SetShellVarContext current

  ; Remove desktop shortcut
  Delete "$DESKTOP\Law Office Management.lnk"

  ; Remove start menu shortcuts
  Delete "$SMPROGRAMS\Law Office Management\Law Office Management.lnk"
  Delete "$SMPROGRAMS\Law Office Management\Uninstall Law Office Management.lnk"
  RMDir "$SMPROGRAMS\Law Office Management"

  ; Inform user that data is preserved
  MessageBox MB_OK|MB_ICONINFORMATION "تم إلغاء تثبيت التطبيق.$\r$\n$\r$\nتم الحفاظ على بياناتك (قاعدة البيانات والمستندات والنسخ الاحتياطية) ولن يتم حذفها.$\r$\n$\r$\nيمكنك إعادة تثبيت التطبيق لاحقاً واختيار نفس مجلد البيانات."

  ; Remove config directory only (not the data directory)
  RMDir /r "$APPDATA\law-office-management"
!macroend
