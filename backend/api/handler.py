import json
import os
import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import boto3
from aws_lambda_typing.context import Context
from aws_lambda_typing.events import APIGatewayProxyEventV2
from aws_lambda_typing.responses import APIGatewayProxyResponseV2
from mypy_boto3_dynamodb import DynamoDBServiceResource
from mypy_boto3_dynamodb.service_resource import Table
from mypy_boto3_sqs import SQSClient

TABLE_NAME = os.environ["TABLE_NAME"]
QUEUE_URL = os.environ["QUEUE_URL"]
MAX_SECONDS = int(os.environ.get("MAX_SECONDS", "30"))

_dynamodb: DynamoDBServiceResource = boto3.resource("dynamodb")
_db_table: Table = _dynamodb.Table(TABLE_NAME)
_sqs: SQSClient = boto3.client("sqs")


def _get_now_iso() -> str:
    return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _encode_for_json(value: Any) -> int | float:
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    raise TypeError(f"Not JSON serializable: {type(value)}")


def _build_response(status: int, body: Any) -> APIGatewayProxyResponseV2:
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body, default=_encode_for_json),
    }


def _create_task(event: APIGatewayProxyEventV2) -> APIGatewayProxyResponseV2:
    raw_body = event.get("body") or "{}"
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        return _build_response(400, {"error": "body must be JSON"})

    input_seconds = payload.get("input_seconds")
    if not isinstance(input_seconds, int) or isinstance(input_seconds, bool):
        return _build_response(400, {"error": "input_seconds must be an integer"})
    if input_seconds < 0 or input_seconds > MAX_SECONDS:
        return _build_response(
            400,
            {"error": f"input_seconds must be between 0 and {MAX_SECONDS}"},
        )

    task_id = str(uuid.uuid4())
    created_at = _get_now_iso()
    item: dict[str, str | int] = {
        "task_id": task_id,
        "input_seconds": input_seconds,
        "status": "pending",
        "created_at": created_at,
    }
    _db_table.put_item(Item=item)
    _sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({"task_id": task_id, "input_seconds": input_seconds}),
    )
    return _build_response(201, item)


def _list_tasks() -> APIGatewayProxyResponseV2:
    items: list[dict[str, Any]] = []
    scan_kwargs: dict[str, Any] = {}
    while True:
        response = _db_table.scan(**scan_kwargs)
        items.extend(response.get("Items", []))
        if "LastEvaluatedKey" not in response:
            break
        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

    items.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return _build_response(200, items)


def handler(event: APIGatewayProxyEventV2, _context: Context) -> APIGatewayProxyResponseV2:
    route = event.get("routeKey")
    if not route:
        method = event.get("requestContext", {}).get("http", {}).get("method")
        raw_path = event.get("rawPath")
        route = f"{method} {raw_path}"
    if route == "POST /tasks":
        return _create_task(event)
    if route == "GET /tasks":
        return _list_tasks()
    return _build_response(404, {"error": "not found", "route": route})
