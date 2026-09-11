import time
from typing import Dict, Any, List
from app.evaluation.dataset import EVALUATION_DATASET
from app.agents.master_agent import master_agent

class AIEvaluationRunner:
    def run_benchmark(self) -> Dict[str, Any]:
        results = []
        total_scenarios = len(EVALUATION_DATASET)
        correct_root_causes = 0
        relevant_evidence_count = 0
        total_evidence_count = 0
        retrieval_hits = 0
        false_positives = 0
        latencies = []

        for scenario in EVALUATION_DATASET:
            start = time.time()
            context = {
                "error_message": scenario["error_message"],
                "stack_trace": scenario["stack_trace"],
                "git_commits": [
                    {
                        "commit_hash": scenario["recent_commit"],
                        "message": f"update {scenario['expected_category']}",
                        "author": "dev-team",
                        "changed_files": [scenario["expected_root_cause_file"]]
                    }
                ]
            }

            inv_res = master_agent.investigate(context)
            elapsed = time.time() - start
            latencies.append(elapsed)

            root_cause = inv_res.get("root_cause", {})
            predicted_file = root_cause.get("file", "")

            # Verify Root Cause Accuracy
            if scenario["expected_root_cause_file"].lower() in predicted_file.lower():
                correct_root_causes += 1
                retrieval_hits += 1

            # Evidence relevance
            evidence_items = inv_res.get("evidence", [])
            total_evidence_count += len(evidence_items)
            for ev in evidence_items:
                if ev.get("relevance_score", 0) > 0.7:
                    relevant_evidence_count += 1
                else:
                    false_positives += 1

            results.append({
                "scenario_id": scenario["id"],
                "title": scenario["title"],
                "expected": f"{scenario['expected_root_cause_file']}:{scenario['expected_root_cause_line']}",
                "predicted": f"{predicted_file}:{root_cause.get('line')}",
                "correct": scenario["expected_root_cause_file"].lower() in predicted_file.lower(),
                "confidence": inv_res.get("confidence_score"),
                "latency_sec": round(elapsed, 2)
            })

        root_cause_accuracy = round((correct_root_causes / total_scenarios) * 100, 1)
        evidence_relevance = round((relevant_evidence_count / max(1, total_evidence_count)) * 100, 1)
        retrieval_accuracy = round((retrieval_hits / total_scenarios) * 100, 1)
        false_positive_rate = round((false_positives / max(1, total_evidence_count)) * 100, 1)
        avg_latency = round(sum(latencies) / len(latencies), 2)

        return {
            "summary": {
                "root_cause_accuracy_pct": root_cause_accuracy,
                "evidence_relevance_pct": evidence_relevance,
                "retrieval_accuracy_pct": retrieval_accuracy,
                "false_positive_rate_pct": false_positive_rate,
                "avg_latency_sec": avg_latency,
                "total_scenarios_tested": total_scenarios
            },
            "scenario_results": results
        }

eval_runner = AIEvaluationRunner()
