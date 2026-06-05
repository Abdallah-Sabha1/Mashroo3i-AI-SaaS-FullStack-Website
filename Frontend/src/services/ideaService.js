import api from "./api";

const BASE_ENDPOINT = "/api/BusinessIdea";

export const SECTOR_IDS = [
  "retail",
  "food",
  "education",
  "tech",
  "services",
  "health",
  "other",
];

export async function submitIdea(data) {
  const title = (data.title ?? "").trim();
  const description = (data.description ?? "").trim();

  if (!title) throw new Error("Idea title is required.");
  if (title.length > 120)
    throw new Error("Title must be 120 characters or fewer.");
  if (description.length < 100)
    throw new Error("Description must be at least 100 characters.");
  if (description.length > 800)
    throw new Error("Description must be 800 characters or fewer.");
  if (!SECTOR_IDS.includes(data.sector))
    throw new Error("Please select a sector.");

  const estimatedBudget =
    Number(data.estimatedBudget) > 0 ? Number(data.estimatedBudget) : 1;

  return api.post(BASE_ENDPOINT, {
    auth: true,
    body: {
      title,
      description,
      sector: data.sector,
      estimatedBudget,
    },
  });
}

export async function listMyIdeas() {
  return api.get(BASE_ENDPOINT, { auth: true });
}

export async function getIdea(id) {
  return api.get(`${BASE_ENDPOINT}/${encodeURIComponent(id)}`, { auth: true });
}

export async function deleteIdea(id) {
  return api.delete(`${BASE_ENDPOINT}/${encodeURIComponent(id)}`, {
    auth: true,
  });
}
