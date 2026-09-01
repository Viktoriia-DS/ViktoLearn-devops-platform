# ---------- Builder ----------
FROM python:3.13-slim AS builder

WORKDIR /app

COPY requirements-prod.txt .

RUN pip install \
    --no-cache-dir \
    --prefix=/install \
    -r requirements-prod.txt


# ---------- Runtime ----------
FROM python:3.13-slim AS runtime

WORKDIR /app

COPY --from=builder /install /usr/local

# Remove package-management tooling from the runtime image
RUN python -m pip uninstall --yes pip setuptools 2>/dev/null || true

COPY app ./app

RUN groupadd --system --gid 999 viktolearn \
    && useradd --system \
       --uid 999 \
       --gid 999 \
       --create-home \
       viktolearn \
    && chown -R 999:999 /app

USER 999:999

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
