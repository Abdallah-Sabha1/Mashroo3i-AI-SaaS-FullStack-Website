/**
 * evaluationService.js — Evaluation API calls
 * ──────────────────────────────────────────────────────────────────────────
 * Two endpoints on EvaluationController:
 *
 *   POST /api/evaluation/{ideaId}/start
 *     → 202 Accepted — kicks off background evaluation
 *     → 200 OK       — already completed
 *     → 202 Accepted — already in progress
 *
 *   GET /api/evaluation/{ideaId}/results
 *     → { ideaId, status, scoring, swot, market }
 *       status: "submitted" | "analyzing" | "completed" | "failed"
 *       scoring: null while step 1 is running
 *       swot:    null while step 2 is running
 *       market:  null while step 3 is running
 *
 * Evaluation runs 3 sequential AI steps in the background:
 *   Step 1 → scoring   (scores, verdict, summary, concerns, recommendations)
 *   Step 2 → swot      (SWOT quadrants + risk cards)
 *   Step 3 → market    (market size, competitors, differentiation, opportunities, fatal flaw)
 *
 * The frontend polls /results every 3 s. Each field appears as its step
 * completes. All three are non-null when status === "completed".
 */

import api from './api'

const BASE = '/api/evaluation'

// ─────────────────────────────────────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fire the evaluation. Backend returns 202 immediately — AI pipeline runs
 * in the background. Poll getEvaluationResults() to track progress.
 *
 * @param {string} ideaId
 * @returns {Promise<{ message: string, ideaId: string, status: string }>}
 */
export async function startEvaluation(ideaId) {
  return api.post(`${BASE}/${encodeURIComponent(ideaId)}/start`, { auth: true })
}

/**
 * Poll after startEvaluation(). Returns partial data while analyzing.
 * scoring → swot → market appear one by one as each AI step finishes.
 * All three are non-null when status === "completed".
 *
 * @param {string} ideaId
 * @returns {Promise<EvaluationResult>}
 */
export async function getEvaluationResults(ideaId) {
  return api.get(`${BASE}/${encodeURIComponent(ideaId)}/results`, { auth: true })
}

// ─────────────────────────────────────────────────────────────────────────────
// TypeDefs — exact JSON shape the backend returns
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} EvaluationResult
 * @property {string}               ideaId
 * @property {'submitted'|'analyzing'|'completed'|'failed'} status
 * @property {ScoringResult|null}   scoring
 * @property {SwotResult|null}      swot
 * @property {MarketResult|null}    market
 */

/**
 * @typedef {Object} ScoringResult
 * @property {number}   overallScore
 * @property {number}   marketScore
 * @property {number}   financialScore
 * @property {number}   executionScore
 * @property {number}   innovationScore
 * @property {string}   verdict          "Highly Promising" | "Promising" | "Needs Refinement" | "High Risk" | "Not Viable"
 * @property {string}   summary
 * @property {string[]} strengths
 * @property {string[]} concerns
 * @property {string[]} recommendations
 */

/**
 * @typedef {Object} SwotResult
 * @property {string} strengths        newline-separated bullet points
 * @property {string} weaknesses       newline-separated bullet points
 * @property {string} opportunities    newline-separated bullet points
 * @property {string} threats          newline-separated bullet points
 * @property {string} risks            JSON string → RiskItem[]
 * @property {'Low'|'Medium'|'High'|'Critical'} overallRiskLevel
 */

/**
 * @typedef {Object} MarketResult
 *
 * Flat fields (strings from DB):
 * @property {string}   marketSize              e.g. "~45M JOD"
 * @property {'HIGH'|'MEDIUM'|'LOW'} saturation
 * @property {'GROWING'|'STABLE'|'DECLINING'} marketTrend
 * @property {string}   marketTrendReason       one sentence
 * @property {string}   fatalFlaws              the single biggest threat → rendered as "Watch Out"
 * @property {string}   likelyFailureMode       one-sentence failure scenario
 * @property {string}   competitorAnalysis      prose summary (not used in the tab directly)
 * @property {string}   differentiationAnalysis 2-sentence differentiation assessment
 *
 * Deserialized JSON columns (backend parses before sending):
 * @property {CompetitorItem[]} competitors
 * @property {string[]}         marketOpportunities  plain strings, no title/body split
 *
 * Meta:
 * @property {string}   analyzedAt              ISO datetime "2026-04-28T14:33:00Z"
 */

/**
 * @typedef {Object} CompetitorItem
 * @property {string}                  name
 * @property {string}                  description
 * @property {'HIGH'|'MEDIUM'|'LOW'}   threat
 * @property {string}                  priceRange      "150–350 JOD/mo"
 * @property {string}                  targetSegment   who they serve
 * @property {string}                  mainStrength    their biggest advantage
 */