Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"

Name "L-Vibe"
OutFile "${L_VIBE_OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\L-Vibe"
RequestExecutionLevel user
SetCompressor /SOLID zlib
SetDatablockOptimize on
Icon "${L_VIBE_ICON}"
UninstallIcon "${L_VIBE_ICON}"
ShowInstDetails show
ShowUninstDetails show
!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Korean"
!insertmacro MUI_LANGUAGE "English"

Function .onInit
  SetShellVarContext current
  ${IfNot} ${RunningX64}
    MessageBox MB_OK|MB_ICONSTOP "L-Vibe는 Windows x64에서 사용할 수 있습니다."
    Abort
  ${EndIf}
FunctionEnd

Section "L-Vibe"
  SetShellVarContext current
  ; Only installed product resources are replaced; user data is outside INSTDIR.
  ; Close the app before upgrading, so runtime files are not in use.
  RMDir /r "$INSTDIR\resources"
  RMDir /r "$INSTDIR\locales"
  SetOutPath "$INSTDIR"
  File /r "${L_VIBE_APP_DIR}\*"
  WriteUninstaller "$INSTDIR\Uninstall L-Vibe.exe"
  CreateDirectory "$SMPROGRAMS\L-Vibe"
  CreateShortcut "$SMPROGRAMS\L-Vibe\L-Vibe.lnk" "$INSTDIR\L-Vibe.exe"
  CreateShortcut "$DESKTOP\L-Vibe.lnk" "$INSTDIR\L-Vibe.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "DisplayName" "L-Vibe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "DisplayVersion" "${L_VIBE_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "Publisher" "L-Vibe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "DisplayIcon" "$INSTDIR\L-Vibe.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "UninstallString" '"$INSTDIR\Uninstall L-Vibe.exe"'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe" "NoRepair" 1
  CreateDirectory "$APPDATA\L-Vibe"
  IfFileExists "$APPDATA\L-Vibe\settings.enc.json" import_done
  IfFileExists "$APPDATA\L-Vibe\config-import.json" open_config
  IfFileExists "$EXEDIR\agent-config.json" 0 default_config
    CopyFiles /SILENT "$EXEDIR\agent-config.json" "$APPDATA\L-Vibe\config-import.json"
    Goto open_config
  default_config:
    CopyFiles /SILENT "$INSTDIR\resources\l-vibe\agent-config.example.json" "$APPDATA\L-Vibe\config-import.json"
  open_config:
    IfSilent import_done
    Exec '"$SYSDIR\notepad.exe" "$APPDATA\L-Vibe\config-import.json"'
  import_done:
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  Delete "$DESKTOP\L-Vibe.lnk"
  RMDir /r "$SMPROGRAMS\L-Vibe"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\L-Vibe"
  RMDir /r "$INSTDIR"
  ; APPDATA\L-Vibe, including encrypted settings and history, is retained.
SectionEnd
