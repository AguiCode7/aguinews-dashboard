// Contrato con la API: mismos nombres que el JSON de /api/summaries.
export interface Summary {
  id: string;
  content: string;
  source: string;
  newsCount: number;
  createdAt: string; // ISO en UTC
}
