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
  ${NSD_CreateLabel} 0 0 100% 12u "Data Directory Selection"
  Pop $Label

  ; Set bold font for title
  CreateFont $0 "$(^Font)" 10 700
  SendMessage $Label ${WM_SETFONT} $0 0

  ; Instructions
  ${NSD_CreateLabel} 0 20u 100% 36u "Please select where you want to store your law office data, including the database, documents, and backups.$\r$\n$\r$\nIMPORTANT: Choose a location that is regularly backed up to prevent data loss."
  Pop $InfoLabel

  ; Data Directory Label
  ${NSD_CreateLabel} 0 62u 100% 12u "Data Directory:"
  Pop $Label

  ; Data Directory Text Box
  ${NSD_CreateText} 0 75u 80% 12u "$DataDirText"
  Pop $DataDir

  ; Browse Button
  ${NSD_CreateButton} 82% 75u 18% 12u "Browse..."
  Pop $BrowseButton
  ${NSD_OnClick} $BrowseButton BrowseForDirectory

  ; Additional Info
  ${NSD_CreateLabel} 0 95u 100% 24u "This directory will contain:$\r$\n  • SQLite database (law-office.db)$\r$\n  • Uploaded documents and files$\r$\n  • Application settings"
  Pop $Label

  nsDialogs::Show
FunctionEnd

; Browse button click handler
Function BrowseForDirectory
  nsDialogs::SelectFolderDialog "Select Data Directory" "$DataDirText"
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
    MessageBox MB_OK|MB_ICONEXCLAMATION "Please select a data directory."
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
  FileWrite $1 "Law Office Management System - Data Directory$\r$\n"
  FileWrite $1 "============================================$\r$\n$\r$\n"
  FileWrite $1 "This directory contains all data for your Law Office Management System.$\r$\n$\r$\n"
  FileWrite $1 "IMPORTANT:$\r$\n"
  FileWrite $1 "- Regularly backup this entire directory to prevent data loss$\r$\n"
  FileWrite $1 "- Do not manually modify the database files$\r$\n"
  FileWrite $1 "- Keep this directory secure as it contains confidential client information$\r$\n$\r$\n"
  FileWrite $1 "Directory Structure:$\r$\n"
  FileWrite $1 "- law-office.db: Main database file$\r$\n"
  FileWrite $1 "- documents/: Uploaded documents and files$\r$\n"
  FileWrite $1 "- backups/: Database backup files$\r$\n"
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

  ; Ask user if they want to remove data directory
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to remove all application data, including the database and documents?$\r$\n$\r$\nWARNING: This action cannot be undone. Make sure you have a backup if needed.$\r$\n$\r$\nClick NO to keep your data for future reinstallation." IDYES RemoveData IDNO KeepData

  RemoveData:
    ; Read the data path
    SetShellVarContext current
    FileOpen $1 "$APPDATA\law-office-management\data-path.txt" r
    FileRead $1 $0
    FileClose $1

    ; Remove data directory
    RMDir /r "$0"

    MessageBox MB_OK|MB_ICONINFORMATION "All application data has been removed."
    Goto EndUninstall

  KeepData:
    MessageBox MB_OK|MB_ICONINFORMATION "Your data has been preserved. You can reinstall the application later and select the same data directory."

  EndUninstall:
  ; Remove config directory
  RMDir /r "$APPDATA\law-office-management"
!macroend
