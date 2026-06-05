import api from './api'

const BASE = '/api/financial-plans'

export async function getFinancialPlan(ideaId) {
  return api.get(`${BASE}/${ideaId}`, { auth: true })
}

export async function saveFinancialPlan(ideaId, inputs) {
  return api.post(`${BASE}/${ideaId}`, {
    auth: true,
    body: {
      capEx:             inputs.capex,
      opEx:              inputs.opex,
      ticketSize:        inputs.ticket,
      customersPerMonth: inputs.customers,
      grossMargin:       inputs.margin,
      monthlyGrowth:     inputs.growth,
    },
  })
}

export async function fetchAIInsights(ideaId, { inputs, projections, sectorLabel }) {
  return api.post(`${BASE}/${ideaId}/insights`, {
    auth: true,
    body: {
      sectorLabel,
      capEx:         inputs.capex,
      opEx:          inputs.opex,
      ticket:        inputs.ticket,
      customers:     inputs.customers,
      margin:        inputs.margin,
      growth:        inputs.growth,
      year1Revenue:  Math.round(projections.year1Revenue),
      year1Profit:   Math.round(projections.year1Profit),
      year1Cogs:     Math.round(projections.year1Cogs),
      year1Opex:     Math.round(projections.year1Opex),
      roi:           Math.round(projections.roi),
      breakEvenMonth: projections.breakEvenMonth ?? null,
    },
  })
}
