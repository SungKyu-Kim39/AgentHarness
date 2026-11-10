; Only L-Vibe directories are managed. Do not run the upstream migration that
; moves/deletes files belonging to other OpenCode channels. ACL validation is a
; release blocker; this initial overlay does not modify Windows permissions.
!macro customInit
  SetShellVarContext current
  StrCpy $INSTDIR "$LOCALAPPDATA\Programs\L-Vibe"
!macroend

!macro customInstall
  SetShellVarContext current
  CreateDirectory "$APPDATA\L-Vibe"
  IfFileExists "$APPDATA\L-Vibe\settings.enc.json" l_vibe_import_done
  IfFileExists "$APPDATA\L-Vibe\config-import.json" l_vibe_import_done
  IfFileExists "$EXEDIR\agent-config.json" 0 l_vibe_import_done
    CopyFiles /SILENT "$EXEDIR\agent-config.json" "$APPDATA\L-Vibe\config-import.json"
  l_vibe_import_done:
!macroend
