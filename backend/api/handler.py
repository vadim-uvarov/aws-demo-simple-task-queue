import json
import os
import uuid
from datetime import UTC, datetime
from decimal import Decimal

import boto3

TABLE_NAME = os.environ["TABLE_NAME"]
QUEUE_URL = os.environ["QUEUE_URL"]
MAX_SECONDS = int(os.environ.get("MAX_SECONDS", "30"))

_dynamodb = boto3.resource("dynamodb")
_table = _dynamodb.Table(TABLE_NAME)
_sqs = boto3.client("sqs")


def _now_iso() -> str:
    return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _json_default(value):
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    raise TypeError(f"Not JSON serializable: {type(value)}")


def _response(status: int, body) -> dict:
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body, default=_json_default),
    }


def _create_task(event: dict) -> dict:
    raw_body = event.get("body") or "{}"
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        return _response(400, {"error": "body must be JSON"})

    seconds = payload.get("seconds")
    if not isinstance(seconds, int) or isinstance(seconds, bool):
        return _response(400, {"error": "seconds must be an integer"})
    if seconds < 0 or seconds > MAX_SECONDS:
        return _response(400, {"error": f"seconds must be between 0 and {MAX_SECONDS}"})

    task_id = str(uuid.uuid4())
    created_at = _now_iso()
    item = {
        "task_id": task_id,
        "seconds": seconds,
        "status": "pending",
        "created_at": created_at,
    }
    _table.put_item(Item=item)
    _sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({"task_id": task_id, "seconds": seconds}),
    )
    return _response(201, item)


def _list_tasks() -> dict:
    items: list[dict] = []
    scan_kwargs: dict = {}
    while True:
        resp = _table.scan(**scan_kwargs)
        items.extend(resp.get("Items", []))
        if "LastEvaluatedKey" not in resp:
            break
        scan_kwargs["ExclusiveStartKey"] = resp["LastEvaluatedKey"]

    items.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return _response(200, items)


def handler(event, _context):
    route = event.get("routeKey")
    if not route:
        method = event.get("requestContext", {}).get("http", {}).get("method")
        raw_path = event.get("rawPath")
        route = f"{method} {raw_path}"
    if route == "POST /tasks":
        return _create_task(event)
    if route == "GET /tasks":
        return _list_tasks()
    return _response(404, {"error": "not found", "route": route})
