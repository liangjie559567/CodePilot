#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Convert CodeT5+ PyTorch models to ONNX format."""

import torch
from transformers import T5ForConditionalGeneration, AutoTokenizer
import os
from pathlib import Path

def convert_model(model_name: str, output_dir: str):
    """Convert a single CodeT5+ model to ONNX."""
    print(f"Loading {model_name}...")
    model = T5ForConditionalGeneration.from_pretrained(
        model_name,
        torch_dtype=torch.float32
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    model.eval()

    # Create output directory
    output_path = Path(output_dir) / model_name.split('/')[-1]
    output_path.mkdir(parents=True, exist_ok=True)

    # Prepare dummy input
    dummy_input = tokenizer("def add(a, b):", return_tensors="pt")
    input_ids = dummy_input["input_ids"]

    print(f"Converting to ONNX...")
    torch.onnx.export(
        model,
        (input_ids,),
        str(output_path / "model.onnx"),
        input_names=["input_ids"],
        output_names=["output"],
        dynamic_axes={
            "input_ids": {0: "batch", 1: "sequence"},
            "output": {0: "batch", 1: "sequence"}
        },
        opset_version=14
    )

    tokenizer.save_pretrained(str(output_path))
    print(f"[OK] Saved to {output_path}")

if __name__ == "__main__":
    models = [
        "Salesforce/codet5-base",
        "Salesforce/codet5-large"
    ]

    output_dir = "models"

    for model_name in models:
        try:
            convert_model(model_name, output_dir)
        except Exception as e:
            print(f"[FAIL] {model_name}: {e}")
