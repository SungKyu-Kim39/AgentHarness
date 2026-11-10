; L-Vibe-only per-user install. Encrypted configuration survives upgrades/removal.
!macro customInit
  SetShellVarContext current
  StrCpy $INSTDIR "$LOCALAPPDATA\Programs\L-Vibe"
!macroend

!macro customInstall
  SetShellVarContext current
  CreateDirectory "$APPDATA\L-Vibe"
  IfFileExists "$APPDATA\L-Vibe\settings.enc.json" l_vibe_import_done
  IfFileExists "$APPDATA\L-Vibe\config-import.json" l_vibe_import_done
  IfFileExists "$EXEDIR\agent-config.json" 0 l_vibe_default_template
    CopyFiles /SILENT "$EXEDIR\agent-config.json" "$APPDATA\L-Vibe\config-import.json"
    Goto l_vibe_open_config
  l_vibe_default_template:
    CopyFiles /SILENT "$INSTDIR\resources\l-vibe\agent-config.example.json" "$APPDATA\L-Vibe\config-import.json"
  l_vibe_open_config:
    IfSilent l_vibe_import_done
    Exec '"$SYSDIR\notepad.exe" "$APPDATA\L-Vibe\config-import.json"'
  l_vibe_import_done:
!macroend
