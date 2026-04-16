import json
import os
import time
from datetime import UTC, datetime
from decimal import Decimal

import boto3

TABLE_NAME = os.environ["TABLE_NAME"]

_table = boto3.resource("dynamodb").Table(TABLE_NAME)


def _now_iso() -> str:
    return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _mark_in_progress(task_id: str) -> None:
    _table.update_item(
        Key={"task_id": task_id},
        UpdateExpression="SET #s = :s, started_at = :t",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": "in_progress", ":t": _now_iso()},
    )


def _mark_completed(task_id: str, elapsed: float) -> None:
    _table.update_item(
        Key={"task_id": task_id},
        UpdateExpression=(
            "SET #s = :s, completed_at = :c, duration_seconds = :d, #r = :r"
        ),
        ExpressionAttributeNames={"#s": "status", "#r": "result"},
        ExpressionAttributeValues={
            ":s": "completed",
            ":c": _now_iso(),
            ":d": Decimal(f"{elapsed:.3f}"),
            ":r": f"slept for {elapsed:.3f}s",
        },
    )


def _process(body: dict) -> None:
    task_id = body["task_id"]
    seconds = int(body["seconds"])
    _mark_in_progress(task_id)
    t0 = time.monotonic()
    time.sleep(seconds)
    elapsed = time.monotonic() - t0
    _mark_completed(task_id, elapsed)


def handler(event, _context):
    for record in event.get("Records", []):
        body = json.loads(record["body"])
        _process(body)
    return {"ok": True}
