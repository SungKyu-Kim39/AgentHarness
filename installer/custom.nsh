!macro customInstall
  ; $EXEDIR is the installer directory, never the app directory or CWD.
  ; Preserve existing and damaged settings for explicit user recovery.
  SetShellVarContext current
  CreateDirectory "$APPDATA\L-Vibe"
  IfFileExists "$APPDATA\L-Vibe\settings.enc.json" import_done
  IfFileExists "$APPDATA\L-Vibe\config-import.json" import_done
  IfFileExists "$EXEDIR\agent-config.json" 0 import_done
    CopyFiles /SILENT "$EXEDIR\agent-config.json" "$APPDATA\L-Vibe\config-import.json"
  import_done:
!macroend
