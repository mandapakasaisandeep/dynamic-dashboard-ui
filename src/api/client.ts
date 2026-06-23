import axios from "axios";
import type {
  DashboardDto,
  UserDto,
  WidgetDataResponse,
  WidgetDto,
  WidgetTypeSchema,
} from "./types";

// Empty base => same-origin "/api", which the Vite dev server proxies to the
// .NET backend. Set VITE_API_BASE_URL to hit the API directly.
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const http = axios.create({ baseURL });

// ---- Dashboards ----
export interface CreateDashboardBody {
  name: string;
  description?: string;
  ownerId: string;
  isShared?: boolean;
}

export const DashboardsApi = {
  list: () => http.get<DashboardDto[]>("/api/dashboards").then((r) => r.data),
  get: (id: string) =>
    http.get<DashboardDto>(`/api/dashboards/${id}`).then((r) => r.data),
  create: (body: CreateDashboardBody) =>
    http.post<DashboardDto>("/api/dashboards", body).then((r) => r.data),
  update: (id: string, body: Partial<DashboardDto> & { id: string }) =>
    http.put(`/api/dashboards/${id}`, body),
  remove: (id: string) => http.delete(`/api/dashboards/${id}`),
};

// ---- Widgets ----
export interface CreateWidgetBody {
  widgetType: string;
  title?: string;
  config: string;
  position: string;
}

export const WidgetsApi = {
  byDashboard: (dashboardId: string) =>
    http
      .get<WidgetDto[]>(`/api/widgets/dashboard/${dashboardId}`)
      .then((r) => r.data),
  create: (dashboardId: string, body: CreateWidgetBody) =>
    http
      .post<WidgetDto>(`/api/dashboards/${dashboardId}/widgets`, body)
      .then((r) => r.data),
  update: (id: string, body: WidgetDto) =>
    http.put(`/api/widgets/${id}`, body),
  remove: (id: string) => http.delete(`/api/widgets/${id}`),
  data: (id: string) =>
    http
      .post<WidgetDataResponse>(`/api/widgets/${id}/data`)
      .then((r) => r.data),
};

// ---- Users ----
export const UsersApi = {
  list: () => http.get<UserDto[]>("/api/users").then((r) => r.data),
};

// ---- Widget type schemas ----
export const WidgetTypesApi = {
  list: () =>
    http.get<WidgetTypeSchema[]>("/api/widget-types").then((r) => r.data),
};
