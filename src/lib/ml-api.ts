// ML API Service untuk Frontend (TypeScript/JavaScript)
// File: src/lib/ml-api.ts

import React from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ML_API_BASE_URL = `${API_BASE}/api/ml`;

// Helper function untuk get auth token dari storage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    // Check for access_token (used by this app) or token
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("token")
    );
  }
  return null;
};

// Helper function untuk create headers
const createHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn(
        "ML API: No authentication token found. Please login first."
      );
    }
  }

  return headers;
};

// ==================== CLUSTERING API ====================

export interface ClusteringInput {
  F502: number; // Gaji
  F505: number; // Jam kerja per minggu
  F14_enc: number; // Encoded F14
  F5d_enc: number; // Encoded F5d
  F1101_enc: number; // Encoded F1101
}

export interface ClusteringOutput {
  cluster: number;
  cluster_label: string;
  pca_coordinates?: {
    pc1: number;
    pc2: number;
  };
}

export interface ClusteringBatchOutput {
  results: ClusteringOutput[];
  pca_variance?: number[];
}

export const clusteringPredict = async (
  data: ClusteringInput | ClusteringInput[]
): Promise<ClusteringOutput | ClusteringBatchOutput> => {
  const response = await fetch(`${ML_API_BASE_URL}/clustering/predict/`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please login first.");
    }

    try {
      const error = await response.json();
      throw new Error(
        error.error || error.detail || "Clustering prediction failed"
      );
    } catch (e) {
      throw new Error(
        `Clustering prediction failed with status ${response.status}`
      );
    }
  }

  return response.json();
};

export const getClusteringInfo = async () => {
  const response = await fetch(`${ML_API_BASE_URL}/clustering/info/`, {
    method: "GET",
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to get clustering info");
  }

  return response.json();
};

// ==================== FORECASTING API ====================

export interface ForecastData {
  model_info: {
    model_name: string;
    arima_order: number[];
    aic: number;
    bic: number;
  };
  training_period: {
    start_year: number;
    end_year: number;
    n_years: number;
  };
  historical_data: Array<{ year: number; lulusan: number }>;
  forecast_data: Array<{ year: number; lulusan: number }>;
  forecast_years: number[];
  forecast_values: number[];
}

export interface CustomForecastOutput {
  forecast_years: number[];
  forecast_values: number[];
  model_info: {
    arima_order: number[];
    aic: number;
    bic: number;
  };
}

export const getForecastData = async (): Promise<ForecastData> => {
  const response = await fetch(`${ML_API_BASE_URL}/forecast/`, {
    method: "GET",
    headers: createHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication required. Please login first.");
    }

    try {
      const error = await response.json();
      throw new Error(
        error.error || error.detail || "Failed to get forecast data"
      );
    } catch (e) {
      throw new Error(
        `Failed to get forecast data with status ${response.status}`
      );
    }
  }

  return response.json();
};

export const getCustomForecast = async (
  steps: number = 5
): Promise<CustomForecastOutput> => {
  const response = await fetch(`${ML_API_BASE_URL}/forecast/custom/`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({ steps }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Custom forecast failed");
  }

  return response.json();
};

export const getForecastInfo = async () => {
  const response = await fetch(`${ML_API_BASE_URL}/forecast/info/`, {
    method: "GET",
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to get forecast info");
  }

  return response.json();
};

// ==================== HEALTH CHECK ====================

export interface HealthCheckResult {
  overall_status: "healthy" | "degraded";
  models: {
    classification: { status: string; error: string | null };
    clustering: { status: string; error: string | null };
    forecasting: { status: string; error: string | null };
  };
}

export const checkMLHealth = async (): Promise<HealthCheckResult> => {
  const response = await fetch(`${ML_API_BASE_URL}/health/`, {
    method: "GET",
    headers: createHeaders(false), // No auth required
  });

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json();
};

// ==================== REACT HOOKS ====================

// React hook untuk clustering
export const useClustering = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<
    ClusteringOutput | ClusteringBatchOutput | null
  >(null);

  const predict = async (data: ClusteringInput | ClusteringInput[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await clusteringPredict(data);
      setResult(response);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Clustering failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { predict, loading, error, result };
};

// React hook untuk forecast
export const useForecast = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ForecastData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getForecastData();
      setData(response);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch forecast";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const customForecast = async (steps: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCustomForecast(steps);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Custom forecast failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchData, customForecast, loading, error, data };
};
