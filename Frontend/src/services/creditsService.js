/**
 * creditsService.js
 * All evaluation-credit and payment API calls.
 */

import api from "./api";

/** Returns { credits: number } */
export async function getCredits() {
  return api.get("/api/payment/credits", { auth: true });
}

/**
 * Purchase a credit pack.
 * @param {{ pack: 'starter'|'value'|'builder', cardNumber: string, expiry: string, cvv: string }} payload
 */
export async function purchaseCredits(payload) {
  return api.post("/api/payment/purchase", { auth: true, body: payload });
}

/** Returns array of payment records */
export async function getPaymentHistory() {
  return api.get("/api/payment/history", { auth: true });
}
