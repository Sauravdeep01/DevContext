from typing import List, Dict, Any

EVALUATION_DATASET: List[Dict[str, Any]] = [
    {
        "id": "scenario_01",
        "title": "Unhandled Null Check in Payment Service",
        "error_message": "TypeError: Cannot read properties of undefined (reading 'id')",
        "stack_trace": "TypeError: Cannot read properties of undefined (reading 'id')\n    at paymentService.js:142:31\n    at Layer.handle [as handle_request]",
        "expected_root_cause_file": "paymentService.js",
        "expected_root_cause_line": 142,
        "expected_category": "Missing Null Check",
        "recent_commit": "a82fd31"
    },
    {
        "id": "scenario_02",
        "title": "Slow Query & High Latency on Order History",
        "error_message": "QueryTimeoutError: Connection timed out executing SELECT * FROM orders WHERE user_id = $1",
        "stack_trace": "QueryTimeoutError: execution exceeded 5000ms\n    at dbQuery.js:88:12",
        "expected_root_cause_file": "dbQuery.js",
        "expected_root_cause_line": 88,
        "expected_category": "Missing DB Index",
        "recent_commit": "b911c02"
    },
    {
        "id": "scenario_03",
        "title": "JWT Signature Verification Failure in Auth Service",
        "error_message": "JsonWebTokenError: invalid signature",
        "stack_trace": "JsonWebTokenError: invalid signature\n    at authMiddleware.py:54",
        "expected_root_cause_file": "authMiddleware.py",
        "expected_root_cause_line": 54,
        "expected_category": "Incorrect Environment Variable",
        "recent_commit": "d348a19"
    },
    {
        "id": "scenario_04",
        "title": "Redis Connection Refused on Session Lookup",
        "error_message": "RedisError: Redis connection to 127.0.0.1:6379 failed - ECONNREFUSED",
        "stack_trace": "RedisError: ECONNREFUSED\n    at redisClient.ts:28:10",
        "expected_root_cause_file": "redisClient.ts",
        "expected_root_cause_line": 28,
        "expected_category": "Configuration Error",
        "recent_commit": "e7710bc"
    }
]
