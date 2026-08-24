import time

from prometheus_client import Counter, Histogram
from starlette.middleware.base import BaseHTTPMiddleware

REQUEST_COUNT = Counter(
    "viktolearn_http_requests_total",
    "Total number of HTTP requests",
    ["method", "path", "status_code"],
)

REQUEST_LATENCY = Histogram(
    "viktolearn_http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "path"],
)

ERROR_COUNT = Counter(
    "viktolearn_http_errors_total",
    "Total number of HTTP error responses",
    ["method", "path", "status_code"],
)


class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.perf_counter()

        response = await call_next(request)

        duration = time.perf_counter() - start_time

        method = request.method
        path = request.url.path
        status_code = str(response.status_code)

        REQUEST_COUNT.labels(
            method=method,
            path=path,
            status_code=status_code,
        ).inc()

        REQUEST_LATENCY.labels(
            method=method,
            path=path,
        ).observe(duration)

        if response.status_code >= 400:
            ERROR_COUNT.labels(
                method=method,
                path=path,
                status_code=status_code,
            ).inc()

        return response
