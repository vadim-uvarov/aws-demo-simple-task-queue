import json
import os
import time
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import boto3
from aws_lambda_typing.context import Context
from aws_lambda_typing.events import SQSEvent

TABLE_NAME = os.environ["TABLE_NAME"]

_db_table = boto3.resource("dynamodb").Table(TABLE_NAME)


def _get_now_iso() -> str:
    return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _mark_in_progress(task_id: str) -> None:
    _db_table.update_item(
        Key={"task_id": task_id},
        UpdateExpression="SET #s = :s, started_at = :t",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": "in_progress", ":t": _get_now_iso()},
    )


def _mark_completed(task_id: str, elapsed: float) -> None:
    _db_table.update_item(
        Key={"task_id": task_id},
        UpdateExpression=("SET #s = :s, completed_at = :c, duration_seconds = :d, #r = :r"),
        ExpressionAttributeNames={"#s": "status", "#r": "result"},
        ExpressionAttributeValues={
            ":s": "completed",
            ":c": _get_now_iso(),
            ":d": Decimal(f"{elapsed:.3f}"),
            ":r": f"slept for {elapsed:.3f}s",
        },
    )


def _process(body: dict[str, Any]) -> None:
    task_id = body["task_id"]
    input_seconds = int(body["input_seconds"])
    _mark_in_progress(task_id)
    t0 = time.monotonic()
    time.sleep(input_seconds)
    elapsed = time.monotonic() - t0
    _mark_completed(task_id, elapsed)


def handler(event: SQSEvent, _context: Context) -> dict[str, bool]:
    for record in event.get("Records", []):
        raw_body = record.get("body")
        if raw_body is None:
            print(f"Skipping SQS record without body: messageId={record.get('messageId')}")
            continue
        body: dict[str, Any] = json.loads(raw_body)
        _process(body)
    return {"ok": True}
