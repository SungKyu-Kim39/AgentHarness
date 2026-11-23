"""Check the installed module with the installed policy and no model credentials."""
import asyncio
import importlib.util
import os
from pathlib import Path
import sys
import tempfile


def main():
    runtime = Path(sys.executable).resolve().parent.parent
    with tempfile.TemporaryDirectory(prefix="ned-import-check-") as folder:
        keep = {key: value for key, value in os.environ.items() if key.upper() in {"SYSTEMROOT", "WINDIR", "TEMP", "TMP"}}
        os.environ.clear()
        os.environ.update(keep)
        os.environ.update({"HOME": folder, "USERPROFILE": folder, "APPDATA": folder, "LOCALAPPDATA": folder,
                           "HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1", "HF_HUB_DISABLE_TELEMETRY": "1",
                           "LITELLM_LOCAL_MODEL_COST_MAP": "True", "LITELLM_TELEMETRY": "False", "DO_NOT_TRACK": "1", "OTEL_SDK_DISABLED": "true"})
        print("PYTHON_OK", sys.version, flush=True)
        spec = importlib.util.spec_from_file_location("ned_launch", runtime / "launch.py")
        launch = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(launch)
        launch.restrict_python_network({"embedding": {"dense": {"api_base": "http://127.0.0.1:9/v1"}}})
        if hasattr(launch, "configure_mime_types"):
            import mimetypes
            launch.configure_mime_types()
            if mimetypes.guess_type("index.js")[0] not in ("text/javascript", "application/javascript") or mimetypes.guess_type("style.css")[0] != "text/css":
                raise RuntimeError("Ned Studio MIME type configuration failed")
            print("OPENVIKING_MIME_OK", flush=True)
        encodings = launch.configure_tokenizers(runtime / "tokenizers")
        try:
            from openviking.server.app import create_app
            from importlib.metadata import version
            print("OPENVIKING_IMPORT_OK", flush=True)
            print("OPENVIKING_VERSION=" + version("openviking"), flush=True)
            launch.configure_model_queue_wait()
            launch.configure_user_pack_import()
            print("OPENVIKING_ADAPTERS_OK", flush=True)
            import tiktoken
            for name in encodings:
                codec = tiktoken.get_encoding(name)
                sample = "Ned offline tokenizer check."
                if codec.decode(codec.encode(sample)) != sample:
                    raise RuntimeError("Tokenizer round-trip failed")
            print("TOKENIZERS_OK", len(encodings), flush=True)
        finally:
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = None
            if loop is not None and not loop.is_running():
                loop.close()


if __name__ == "__main__":
    main()
