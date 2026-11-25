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
; Windows measurement: LZMA reduced size but regressed installation 54s -> 91s.
; Use fast-to-decode zlib with the packed SDKs and smaller host instead.
SetCompressor zlib
SetDatablockOptimize on
Icon "${NED_ICON}"
UninstallIcon "${NED_ICON}"
!ifdef NED_SIGNTOOL
!uninstfinalize '"${NED_SIGNTOOL}" ${NED_SIGN_ARGS} "%1"'
!endif
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

; User data must remain outside the removable installation tree.
!macro NedMarkPrivatePath DIRECTORY
  StrCpy $2 "${DIRECTORY}"
  StrLen $3 $2
  StrCpy $4 $0 $3
  ${If} $4 == $2
    StrCpy $4 $0 1 $3
    ${If} $4 == ""
    ${OrIf} $4 == "\"
      StrCpy $5 "yes"
    ${EndIf}
  ${EndIf}
!macroend

!macro NedPrivatePathBody
  StrCpy $5 "no"
  !insertmacro NedMarkPrivatePath "$APPDATA\Ned"
  !insertmacro NedMarkPrivatePath "$APPDATA\L-Vibe"
  !insertmacro NedMarkPrivatePath "$LOCALAPPDATA\Ned-Launcher"
!macroend

Function IsPrivateDataDirectory
  !insertmacro NedPrivatePathBody
FunctionEnd
Function un.IsPrivateDataDirectory
  !insertmacro NedPrivatePathBody
FunctionEnd

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
  Call IsPrivateDataDirectory
  ${If} $5 == "yes"
    Return
  ${EndIf}
  IfFileExists "$0\Ned.exe" 0 check_backup
  IfFileExists "$0\resources\app.asar" 0 check_backup
  IfFileExists "$0\resources\ned\agent.cjs" 0 check_backup
    StrCpy $9 "valid"
    Return
  check_backup:
  ; An interrupted upgrade or partial rollback can leave files split between
  ; the live install directory and .ned-upgrade-backup.
  ${If} ${FileExists} "$0\.ned-upgrade-backup\*.*"
    StrCpy $6 "no"
    ${If} ${FileExists} "$0\Ned.exe"
    ${OrIf} ${FileExists} "$0\.ned-upgrade-backup\Ned.exe"
      StrCpy $6 "yes"
    ${EndIf}
    ${If} $6 == "yes"
      ${If} ${FileExists} "$0\resources\app.asar"
      ${AndIf} ${FileExists} "$0\resources\ned\agent.cjs"
        Goto directory_valid
      ${EndIf}
      ${If} ${FileExists} "$0\.ned-upgrade-backup\resources\app.asar"
      ${AndIf} ${FileExists} "$0\.ned-upgrade-backup\resources\ned\agent.cjs"
        Goto directory_valid
      ${EndIf}
    ${EndIf}
  ${EndIf}
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
    SetErrorLevel 1
    Abort
  ${EndIf}
FunctionEnd

Function VerifyInstallDirectory
  Call CheckInstallDirectory
  ${If} $9 != "valid"
    MessageBox MB_OK|MB_ICONSTOP "설치할 빈 전용 폴더 또는 기존 Ned 설치 폴더를 선택하세요. 드라이브 루트, 사용자 데이터 폴더 내부, 다른 파일이 있는 폴더에는 설치할 수 없습니다." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
  StrCpy $INSTDIR "$0"
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "InstallLocation"
  ${If} $0 != ""
  ${AndIf} $0 != $INSTDIR
    ${If} ${FileExists} "$0\Ned.exe"
    ${OrIf} ${FileExists} "$0\.ned-upgrade-backup\Ned.exe"
      Call IsPrivateDataDirectory
      ${If} $5 == "yes"
        MessageBox MB_OK|MB_ICONSTOP "기존 설치 위치가 사용자 데이터 폴더와 겹칩니다. 기존 제거 프로그램을 실행하기 전에 설정·대화·지식을 별도 위치에 백업하고 설치 파일과 사용자 자료를 분리하세요." /SD IDOK
        SetErrorLevel 1
        Abort
      ${EndIf}
      MessageBox MB_OK|MB_ICONSTOP "설치 위치를 옮기려면 기존 Ned를 먼저 제거한 뒤 새 경로에 설치하세요. 설정·대화·지식은 사용자 데이터 폴더에 유지됩니다." /SD IDOK
      SetErrorLevel 1
      Abort
    ${EndIf}
  ${EndIf}
FunctionEnd

!macro NedCheckUnlocked FILEPATH
  ${If} ${FileExists} "${FILEPATH}"
    StrCpy $1 "${FILEPATH}"
    System::Call 'kernel32::CreateFileW(w "$1", i 0x40000000, i 0, p 0, i 3, i 0x80, p 0) p .r2'
    ${If} $2 == -1
    ${OrIf} $2 == 0
      StrCpy $5 "locked"
    ${Else}
      System::Call 'kernel32::CloseHandle(p r2)'
    ${EndIf}
  ${EndIf}
!macroend

Function CheckInstallNotRunning
  StrCpy $5 "ok"
  !insertmacro NedCheckUnlocked "$INSTDIR\Ned.exe"
  ${If} $5 == "ok"
    !insertmacro NedCheckUnlocked "$INSTDIR\resources\zed\Zed.exe"
  ${EndIf}
  ${If} $5 == "ok"
    !insertmacro NedCheckUnlocked "$INSTDIR\resources\opencode-cli.exe"
  ${EndIf}
  ${If} $5 == "ok"
    !insertmacro NedCheckUnlocked "$INSTDIR\resources\runtime\windows-x64\openviking\python\python.exe"
  ${EndIf}
  ${If} $5 == "ok"
    !insertmacro NedCheckUnlocked "$INSTDIR\resources\runtime\windows-x64\mcp\python\python.exe"
  ${EndIf}
  ${If} $5 == "ok"
    !insertmacro NedCheckUnlocked "$INSTDIR\resources\runtime\windows-x64\agent-desktop\agent-desktop.exe"
  ${EndIf}
  ${If} $5 == "locked"
    MessageBox MB_OK|MB_ICONSTOP "Ned 또는 편집기가 실행 중입니다. Zed 편집기와 시스템 트레이의 Ned를 모두 종료한 뒤 설치를 다시 실행하세요. 기존 파일과 사용자 데이터는 보존했습니다." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
FunctionEnd

; Top-level entries owned by released Ned payloads or created by this installer.
!macro NedOwnedEntry NAME
  ${If} $R1 == "${NAME}"
    StrCpy $R2 "yes"
    Return
  ${EndIf}
!macroend

Function IsNedOwnedEntry
  StrCpy $R2 "no"
  !insertmacro NedOwnedEntry "LICENSE.electron.txt"
  !insertmacro NedOwnedEntry "LICENSES.chromium.html"
  !insertmacro NedOwnedEntry "Ned.exe"
  !insertmacro NedOwnedEntry "chrome_100_percent.pak"
  !insertmacro NedOwnedEntry "chrome_200_percent.pak"
  !insertmacro NedOwnedEntry "d3dcompiler_47.dll"
  !insertmacro NedOwnedEntry "dxcompiler.dll"
  !insertmacro NedOwnedEntry "dxil.dll"
  !insertmacro NedOwnedEntry "ffmpeg.dll"
  !insertmacro NedOwnedEntry "icudtl.dat"
  !insertmacro NedOwnedEntry "locales"
  !insertmacro NedOwnedEntry "resources"
  !insertmacro NedOwnedEntry "resources.pak"
  !insertmacro NedOwnedEntry "snapshot_blob.bin"
  !insertmacro NedOwnedEntry "v8_context_snapshot.bin"
  !insertmacro NedOwnedEntry "vk_swiftshader.dll"
  !insertmacro NedOwnedEntry "vk_swiftshader_icd.json"
  !insertmacro NedOwnedEntry "vulkan-1.dll"
  !insertmacro NedOwnedEntry "Uninstall Ned.exe"
FunctionEnd

Function BackupNedInstallation
  StrCpy $7 "ok"
  ClearErrors
  CreateDirectory "$INSTDIR\.ned-upgrade-backup"
  ${If} ${Errors}
    StrCpy $7 "failed"
    Return
  ${EndIf}
  Push ""
  FindFirst $R0 $R1 "$INSTDIR\*.*"
  ${DoWhile} $R1 != ""
    Call IsNedOwnedEntry
    ${If} $R2 == "yes"
      Push "$R1"
    ${EndIf}
    FindNext $R0 $R1
  ${Loop}
  FindClose $R0
  ${Do}
    Pop $R1
    ${If} $R1 == ""
      ${ExitDo}
    ${EndIf}
    ${If} $7 == "ok"
      ClearErrors
      Rename "$INSTDIR\$R1" "$INSTDIR\.ned-upgrade-backup\$R1"
      ${If} ${Errors}
        StrCpy $7 "failed"
      ${EndIf}
    ${EndIf}
  ${Loop}
FunctionEnd

Function CleanPartialNedExtract
  Push ""
  FindFirst $R0 $R1 "$INSTDIR\*.*"
  ${DoWhile} $R1 != ""
    Call IsNedOwnedEntry
    ${If} $R2 == "yes"
      Push "$R1"
    ${EndIf}
    FindNext $R0 $R1
  ${Loop}
  FindClose $R0
  ${Do}
    Pop $R1
    ${If} $R1 == ""
      ${ExitDo}
    ${EndIf}
    ${If} ${FileExists} "$INSTDIR\$R1\*.*"
      RMDir /r "$INSTDIR\$R1"
    ${Else}
      Delete "$INSTDIR\$R1"
    ${EndIf}
  ${Loop}
FunctionEnd

Function RestoreNedUpgradeBackup
  StrCpy $7 "ok"
  ; Only replace paths for which a backup still exists. A partial backup move
  ; leaves the other original paths in place.
  Push ""
  FindFirst $R0 $R1 "$INSTDIR\.ned-upgrade-backup\*.*"
  ${DoWhile} $R1 != ""
    ${If} $R1 != "."
    ${AndIf} $R1 != ".."
      Push "$R1"
    ${EndIf}
    FindNext $R0 $R1
  ${Loop}
  FindClose $R0
  ${Do}
    Pop $R1
    ${If} $R1 == ""
      ${ExitDo}
    ${EndIf}
    Call IsNedOwnedEntry
    ${If} $R2 == "yes"
      ${If} ${FileExists} "$INSTDIR\$R1\*.*"
        RMDir /r "$INSTDIR\$R1"
      ${ElseIf} ${FileExists} "$INSTDIR\$R1"
        Delete "$INSTDIR\$R1"
      ${EndIf}
    ${ElseIf} ${FileExists} "$INSTDIR\$R1"
    ${OrIf} ${FileExists} "$INSTDIR\$R1\*.*"
      ; A pre-rebuild5 installer may have moved user files into this backup.
      ; Keep both copies on collision and ask the user to resolve it.
      StrCpy $7 "failed"
      ${Continue}
    ${EndIf}
    ClearErrors
    Rename "$INSTDIR\.ned-upgrade-backup\$R1" "$INSTDIR\$R1"
    ${If} ${Errors}
      StrCpy $7 "failed"
    ${EndIf}
  ${Loop}
  ${If} $7 == "ok"
    ; A backup that still contains an item must never be deleted on failure.
    ClearErrors
    RMDir "$INSTDIR\.ned-upgrade-backup"
    ${If} ${Errors}
      StrCpy $7 "failed"
    ${EndIf}
  ${EndIf}
FunctionEnd

Section "Ned"
  SetShellVarContext current
  Call VerifyInstallDirectory
  Call CheckInstallNotRunning
  ClearErrors
  CreateDirectory "$INSTDIR"
  ${If} ${Errors}
    MessageBox MB_OK|MB_ICONSTOP "설치 폴더를 만들 수 없습니다. 드라이브 여유 공간과 쓰기 권한을 확인하고 다시 시도하세요." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
  ; Back up all Ned-owned components before replacing them. Files placed
  ; alongside those components by the user stay in the installation folder.
  StrCpy $8 "no"
  ${If} ${FileExists} "$INSTDIR\.ned-upgrade-backup\*.*"
    Call RestoreNedUpgradeBackup
    ${If} $7 != "ok"
      Goto backup_preserved
    ${EndIf}
  ${EndIf}
  ${If} ${FileExists} "$INSTDIR\Ned.exe"
    ${OrIf} ${FileExists} "$INSTDIR\resources\*.*"
    Call BackupNedInstallation
    ${If} $7 != "ok"
      Call RestoreNedUpgradeBackup
      ${If} $7 != "ok"
        Goto backup_preserved
      ${EndIf}
      MessageBox MB_OK|MB_ICONSTOP "기존 Ned 파일이 사용 중이어서 업그레이드를 시작할 수 없습니다. Ned와 편집기를 모두 종료한 뒤 다시 시도하세요. 기존 설치와 사용자 데이터는 보존했습니다." /SD IDOK
      SetErrorLevel 1
      Abort
    ${EndIf}
    StrCpy $8 "yes"
  ${EndIf}
  SetOutPath "$INSTDIR"
  ClearErrors
  File /r "${NED_APP_DIR}\*"
  IfErrors install_failed
  IfFileExists "$INSTDIR\Ned.exe" 0 install_failed
  IfFileExists "$INSTDIR\resources\zed\Zed.exe" 0 install_failed
  IfFileExists "$INSTDIR\resources\zed\bin\zed.exe" 0 install_failed
  IfFileExists "$INSTDIR\resources\app.asar" 0 install_failed
  IfFileExists "$INSTDIR\resources\runtime\windows-x64\openviking\python\Lib\urllib\parse.py" 0 install_failed
  IfFileExists "$INSTDIR\resources\runtime\windows-x64\openviking\python\Lib\site-packages\win32\lib\pywin32_bootstrap.py" 0 install_failed
  IfFileExists "$INSTDIR\resources\runtime\windows-x64\agent-desktop\agent-desktop.exe" 0 install_failed
  Goto install_verified
  install_failed:
    ${If} $8 == "yes"
      Call CleanPartialNedExtract
      Call RestoreNedUpgradeBackup
      ${If} $7 != "ok"
        Goto backup_preserved
      ${EndIf}
      MessageBox MB_OK|MB_ICONSTOP "설치를 완료하지 못해 기존 Ned 파일을 복구했습니다. 디스크 여유 공간과 설치 폴더 권한을 확인한 뒤 다시 시도하세요." /SD IDOK
    ${Else}
      MessageBox MB_OK|MB_ICONSTOP "설치를 완료하지 못했습니다. 디스크 여유 공간과 설치 폴더 권한을 확인한 뒤 다시 시도하세요." /SD IDOK
    ${EndIf}
    SetErrorLevel 1
    Abort
  backup_preserved:
    MessageBox MB_OK|MB_ICONSTOP "이전 Ned 파일을 모두 복구하지 못했습니다. 남은 백업은 설치 폴더의 .ned-upgrade-backup에 보존했습니다. 실행 중인 파일·권한·같은 이름의 개인 파일을 확인한 뒤 같은 경로에서 설치를 다시 실행하세요." /SD IDOK
    SetErrorLevel 1
    Abort
  install_verified:
  ${If} $8 == "yes"
    RMDir /r "$INSTDIR\.ned-upgrade-backup"
  ${EndIf}
  WriteUninstaller "$INSTDIR\Uninstall Ned.exe"
  CreateDirectory "$SMPROGRAMS\Ned"
  CreateShortcut "$SMPROGRAMS\Ned\Ned.lnk" "$INSTDIR\Ned.exe" "" "$INSTDIR\resources\ned\icon.ico"
  CreateShortcut "$DESKTOP\Ned.lnk" "$INSTDIR\Ned.exe" "" "$INSTDIR\resources\ned\icon.ico"
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
    MessageBox MB_OK|MB_ICONSTOP "설치 폴더의 agent-config.json을 준비하지 못했습니다. 폴더 권한과 파일 형식을 확인하고 다시 시도하세요. 기존 사용자 데이터는 보존했습니다." /SD IDOK
    SetErrorLevel 1
    Abort
  import_done:
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  StrCpy $0 "$INSTDIR"
  Call un.IsPrivateDataDirectory
  ${If} $5 == "yes"
    MessageBox MB_OK|MB_ICONSTOP "설치 위치가 사용자 데이터 폴더와 겹쳐 자동 제거를 중단했습니다. 설정·대화·지식을 백업한 뒤 프로그램 파일을 별도로 정리하세요." /SD IDOK
    SetErrorLevel 1
    Abort
  ${EndIf}
  ; A prior installation on another drive must not remove the active shortcuts.
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" "InstallLocation"
  ${If} $0 == $INSTDIR
    Delete "$DESKTOP\Ned.lnk"
    RMDir /r "$SMPROGRAMS\Ned"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned"
  ${EndIf}
  RMDir /r "$INSTDIR"
  ; APPDATA\Ned, including global skills, encrypted settings and history, is retained.
SectionEnd
