Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"

Name "Ned"
OutFile "${NED_OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\Ned"
RequestExecutionLevel user
; The pinned NSIS compiler has a 31-bit data block. Solid compression stores
; the entire uncompressed payload there first; six MCPs exceed that limit.
; Compress each file before adding it, retaining one complete offline EXE.
SetCompressor zlib
SetDatablockOptimize on
Icon "${NED_ICON}"
UninstallIcon "${NED_ICON}"
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
    MessageBox MB_OK|MB_ICONSTOP "Ned는 Windows x64에서 사용할 수 있습니다."
    Abort
  ${EndIf}
FunctionEnd

Section "Ned"
  SetShellVarContext current
  ; Only installed product resources are replaced; user data is outside INSTDIR.
  ; Close the app before upgrading, so runtime files are not in use.
  RMDir /r "$INSTDIR\resources"
  RMDir /r "$INSTDIR\locales"
  SetOutPath "$INSTDIR"
  ClearErrors
  File /r "${NED_APP_DIR}\*"
  IfErrors install_failed
  IfFileExists "$INSTDIR\resources\zed\Zed.exe" 0 install_failed
  IfFileExists "$INSTDIR\resources\zed\bin\zed.exe" 0 install_failed
  IfFileExists "$INSTDIR\resources\app.asar" 0 install_failed
  IfFileExists "$INSTDIR\resources\runtime\windows-x64\openviking\python\Lib\urllib\parse.py" 0 install_failed
  IfFileExists "$INSTDIR\resources\runtime\windows-x64\openviking\python\Lib\site-packages\win32\lib\pywin32_bootstrap.py" 0 install_failed
  IfFileExists "$INSTDIR\resources\runtime\windows-x64\agent-desktop\agent-desktop.exe" 0 install_failed
  Goto install_verified
  install_failed:
    MessageBox MB_OK|MB_ICONSTOP "Ned install is incomplete. Check free disk space and the installation folder. The bundled editor or host is missing. User settings were retained." /SD IDOK
    SetErrorLevel 1
    Abort
  install_verified:
  WriteUninstaller "$INSTDIR\Uninstall Ned.exe"
  CreateDirectory "$SMPROGRAMS\Ned"
  CreateShortcut "$SMPROGRAMS\Ned\Ned.lnk" "$INSTDIR\Ned.exe"
  CreateShortcut "$DESKTOP\Ned.lnk" "$INSTDIR\Ned.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "DisplayName" "Ned"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "DisplayVersion" "${NED_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "Publisher" "Ned"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "DisplayIcon" "$INSTDIR\Ned.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "UninstallString" '"$INSTDIR\Uninstall Ned.exe"'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "NoRepair" 1
  CreateDirectory "$APPDATA\Ned"
  IfFileExists "$APPDATA\Ned\settings.enc.json" import_done
  IfFileExists "$APPDATA\L-Vibe\settings.enc.json" import_done
  IfFileExists "$APPDATA\Ned\config-import.json" open_config
  IfFileExists "$EXEDIR\agent-config.json\*.*" config_failed
  IfFileExists "$EXEDIR\agent-config.json" 0 default_config
    ClearErrors
    CopyFiles /SILENT "$EXEDIR\agent-config.json" "$APPDATA\Ned\config-import.json"
    IfErrors config_failed
    ; User-provided distribution settings are validated/encrypted by first launch.
    ; Do not open the template editor for this successful automatic import path.
    Goto import_done
  default_config:
    ClearErrors
    CopyFiles /SILENT "$INSTDIR\resources\ned\agent-config.example.json" "$APPDATA\Ned\config-import.json"
    IfErrors config_failed
  open_config:
    IfSilent import_done
    Exec '"$SYSDIR\notepad.exe" "$APPDATA\Ned\config-import.json"'
    Goto import_done
  config_failed:
    MessageBox MB_OK|MB_ICONSTOP "Ned could not prepare agent-config.json from the installer folder. Check folder permissions and retry. Existing user data was retained." /SD IDOK
    SetErrorLevel 1
    Abort
  import_done:
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  Delete "$DESKTOP\Ned.lnk"
  RMDir /r "$SMPROGRAMS\Ned"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned"
  RMDir /r "$INSTDIR"
  ; APPDATA\Ned, including encrypted settings and history, is retained.
SectionEnd
