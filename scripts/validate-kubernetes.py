#!/usr/bin/env python3

import sys
from pathlib import Path

import yaml

ALLOWED_SECCOMP_TYPES = {"RuntimeDefault", "Localhost"}


def walk(value, path=""):
    if isinstance(value, dict):
        seccomp = value.get("seccompProfile")

        if isinstance(seccomp, dict) and "type" in seccomp:
            seccomp_type = seccomp["type"]

            if seccomp_type not in ALLOWED_SECCOMP_TYPES:
                raise ValueError(
                    f"Invalid seccompProfile.type at {path or '<root>'}: "
                    f"{seccomp_type!r}"
                )

        for key, child in value.items():
            walk(child, f"{path}.{key}" if path else str(key))

    elif isinstance(value, list):
        for index, child in enumerate(value):
            walk(child, f"{path}[{index}]")


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: validate-kubernetes.py <rendered-manifest.yaml>")

    manifest = Path(sys.argv[1])

    with manifest.open() as f:
        documents = list(yaml.safe_load_all(f))

    checked = 0

    for document in documents:
        if not isinstance(document, dict):
            continue

        kind = document.get("kind", "<unknown>")
        name = document.get("metadata", {}).get("name", "<unknown>")

        try:
            walk(document, f"{kind}/{name}")
        except ValueError as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            raise SystemExit(1)

        checked += 1

    print(f"Kubernetes manifest validation passed: {checked} resources checked")


if __name__ == "__main__":
    main()
