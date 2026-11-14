Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "FileFunc.nsh"

Name "Ned"
OutFile "${NED_OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\Ned"
InstallDirRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "InstallLocation"
RequestExecutionLevel user
; The pinned NSIS compiler has a 31-bit data block. Solid compression stores
; the entire uncompressed payload there first; six MCPs exceed that limit.
; Compress each file before adding it, retaining one complete offline EXE.
SetCompressor lzma
SetDatablockOptimize on
Icon "${NED_ICON}"
UninstallIcon "${NED_ICON}"
ShowInstDetails show
ShowUninstDetails show
!define MUI_ABORTWARNING
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE VerifyInstallDirectory
!insertmacro MUI_PAGE_DIRECTORY
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

; Reject drive roots and nonempty folders that are not an existing Ned install.
; This guard also runs for /S /D=... before any resource cleanup.
Function CheckInstallDirectory
  StrCpy $9 "invalid"
  ; Resolve lexically through Win32: NSIS GetFullPathName can fail for a path
  ; whose final directory does not exist yet. Do not create folders in the
  ; directory-page callback; create the accepted target only when installing.
  StrCpy $0 ""
  System::Call 'kernel32::GetFullPathNameW(w "$INSTDIR", i ${NSIS_MAX_STRLEN}, w .r0, p 0) i .r2'
  ${If} $2 == 0
  ${OrIf} $2 >= ${NSIS_MAX_STRLEN}
    Return
  ${EndIf}
  ${GetRoot} "$0" $1
  ${If} $0 == "$1"
  ${OrIf} $0 == "$1\"
    Return
  ${EndIf}
  IfFileExists "$0\Ned.exe" 0 check_empty
  IfFileExists "$0\resources\app.asar" 0 check_empty
  IfFileExists "$0\resources\ned\agent.cjs" 0 check_empty
    StrCpy $9 "valid"
    Return
  check_empty:
  IfFileExists "$0\*.*" 0 directory_valid
  FindFirst $2 $3 "$0\*.*"
  check_next:
    ${If} $3 == ""
      FindClose $2
      Goto directory_valid
    ${EndIf}
    ${If} $3 != "."
    ${AndIf} $3 != ".."
      FindClose $2
      Return
    ${EndIf}
    FindNext $2 $3
    Goto check_next
  directory_valid:
    StrCpy $9 "valid"
FunctionEnd

Function .onVerifyInstDir
  Call CheckInstallDirectory
  ${If} $9 != "valid"
    Abort
  ${EndIf}
FunctionEnd

Function VerifyInstallDirectory
  Call CheckInstallDirectory
  ${If} $9 != "valid"
    MessageBox MB_OK|MB_ICONSTOP "설치할 빈 전용 폴더 또는 기존 Ned 설치 폴더를 선택하세요. 드라이브 루트나 다른 파일이 있는 폴더에는 설치할 수 없습니다." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
  StrCpy $INSTDIR "$0"
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "InstallLocation"
  ${If} $0 != ""
  ${AndIf} $0 != $INSTDIR
    IfFileExists "$0\Ned.exe" 0 previous_missing
    MessageBox MB_OK|MB_ICONSTOP "설치 위치를 옮기려면 기존 Ned를 먼저 제거한 뒤 새 경로에 설치하세요. 설정·대화·지식은 사용자 데이터 폴더에 유지됩니다." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
  previous_missing:
FunctionEnd

Section "Ned"
  SetShellVarContext current
  Call VerifyInstallDirectory
  ClearErrors
  CreateDirectory "$INSTDIR"
  ${If} ${Errors}
    MessageBox MB_OK|MB_ICONSTOP "설치 폴더를 만들 수 없습니다. 드라이브 여유 공간과 쓰기 권한을 확인하고 다시 시도하세요." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
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
  ; A prior installation on another drive must not remove the active shortcuts.
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "InstallLocation"
  ${If} $0 == $INSTDIR
    Delete "$DESKTOP\Ned.lnk"
    RMDir /r "$SMPROGRAMS\Ned"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned"
  ${EndIf}
  RMDir /r "$INSTDIR"
  ; APPDATA\Ned, including encrypted settings and history, is retained.
SectionEnd
