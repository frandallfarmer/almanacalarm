#!/usr/bin/env python3

import json
import onnx
from typing import Any, Dict

def add_meta_data(filename: str, meta_data: Dict[str, Any]):
    """Embed metadata directly into ONNX model file."""
    model = onnx.load(filename)

    # Clear existing metadata to avoid duplicates
    while len(model.metadata_props) > 0:
        model.metadata_props.pop()

    # Add new metadata
    for key, value in meta_data.items():
        meta = model.metadata_props.add()
        meta.key = key
        meta.value = str(value)

    onnx.save(model, filename)
    print(f"✅ Metadata added to {filename}")

def load_config(model):
    with open(f"{model}.json", "r") as file:
        return json.load(file)

def main():
    filename = "voice-profile-randy-farmer.onnx"
    print(f"Processing {filename}...")

    config = load_config(filename)
    print(f"Loaded config from {filename}.json")

    meta_data = {
        "model_type": "vits",
        "comment": "piper",
        "language": config["espeak"]["voice"],  # en-us
        "voice": config["espeak"]["voice"],
        "has_espeak": 1,
        "n_speakers": config["num_speakers"],
        "sample_rate": config["audio"]["sample_rate"],
    }

    print(f"Metadata to add: {meta_data}")
    add_meta_data(filename, meta_data)
    print("✅ Done! ONNX model now has embedded metadata")

if __name__ == "__main__":
    main()
