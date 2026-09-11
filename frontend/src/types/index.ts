export interface EvidenceItem {
  source_type: 'code' | 'log' | 'git' | 'database' | 'doc';
  source_reference: string;
  content: string;
  relevance_score: number;
}

export interface RootCauseInfo {
  file: string;
  line: number;
  summary: string;
  code_snippet?: string;
}

export interface CorrelatedCommit {
  commit_hash?: string;
  hash?: string;
  author: string;
  timestamp: string;
  message: string;
  changed_files?: string[];
  files_changed?: string[];
}

export interface AgentTrace {
  agent: string;
  status: string;
  findings: string[];
  evidence?: EvidenceItem[];
  retrieved_code_chunks?: any[];
}

export interface InvestigationReport {
  status: string;
  investigation_id: string;
  confidence_score: number;
  root_cause: RootCauseInfo;
  evidence: EvidenceItem[];
  correlated_commit: CorrelatedCommit;
  error_stats: {
    total_occurrences: number;
    error_started: string;
    affected_users: string;
  };
  recommended_next_steps: string[];
  agent_traces: AgentTrace[];
  latency_seconds: number;
}

export interface RetrievedChunk {
  file_path: string;
  chunk_type: string;
  name: string;
  start_line: number;
  end_line: number;
  content: string;
}

export interface AskResponse {
  query: string;
  answer: string;
  relevant_files: string[];
  retrieved_chunks: RetrievedChunk[];
}

export interface ScenarioResult {
  scenario_id: string;
  title: string;
  expected: string;
  predicted: string;
  correct: boolean;
  confidence: number;
  latency_sec: number;
}

export interface EvalMetrics {
  summary: {
    root_cause_accuracy_pct: number;
    evidence_relevance_pct: number;
    retrieval_accuracy_pct: number;
    false_positive_rate_pct: number;
    avg_latency_sec: number;
    total_scenarios_tested: number;
  };
  scenario_results: ScenarioResult[];
}
