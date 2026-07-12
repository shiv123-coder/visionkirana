import { 
  getDashboardStatsApiV1AdminDashboardStatsGet,
  getAuditLogsApiV1AdminAuditLogsGet,
  getUserShopsApiV1ShopsGet,
  getAllApplicationsApiV1AdminApplicationsGet,
  getAllUsersApiV1AdminUsersGet,
  submitDemoRequestApiV1SystemDemoRequestsPost,
  getAllNotificationsApiV1AdminNotificationsGet,
  markNotificationAsReadApiV1AdminNotificationsNotifIdReadPost,
  markAllNotificationsAsReadApiV1AdminNotificationsReadAllPost,
  getAllDemoRequestsApiV1AdminDemoRequestsGet,
  updateDemoRequestStatusApiV1AdminDemoRequestsReqIdPatch
} from "../client"
import "../api-client" // Ensure interceptor is loaded

export const fetchDashboardStats = async () => {
  const { data, error } = await getDashboardStatsApiV1AdminDashboardStatsGet()
  if (error) throw error
  return data
}

export const fetchAuditLogs = async (skip: number = 0, limit: number = 50) => {
  const { data, error } = await getAuditLogsApiV1AdminAuditLogsGet({ query: { skip, limit } })
  if (error) throw error
  return data
}

export const fetchAdminShops = async (skip: number = 0, limit: number = 50) => {
  const { data, error } = await getUserShopsApiV1ShopsGet({ query: { skip, limit } })
  if (error) throw error
  return data
}

export const fetchAdminApplications = async (skip: number = 0, limit: number = 50) => {
  const { data, error } = await getAllApplicationsApiV1AdminApplicationsGet({ query: { skip, limit } })
  if (error) throw error
  return data
}

export const fetchAdminUsers = async (skip: number = 0, limit: number = 50): Promise<any[]> => {
  const { data, error } = await getAllUsersApiV1AdminUsersGet({ query: { skip, limit } })
  if (error) throw error
  return data as any[]
}

export const updateApplicationStatus = async (appId: string, status: string) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/admin/applications/${appId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update application status');
  }
  
  return response.json();
}

export const submitDemoRequest = async (payload: any) => {
  const { data, error } = await submitDemoRequestApiV1SystemDemoRequestsPost({ body: payload })
  if (error) throw error
  return data
}

export const fetchAdminNotifications = async (skip: number = 0, limit: number = 50) => {
  const { data, error } = await getAllNotificationsApiV1AdminNotificationsGet({ query: { skip, limit } })
  if (error) throw error
  return data
}

export const markNotificationAsRead = async (id: string) => {
  const { data, error } = await markNotificationAsReadApiV1AdminNotificationsNotifIdReadPost({ path: { notif_id: id } })
  if (error) throw error
  return data
}

export const markAllNotificationsAsRead = async () => {
  const { data, error } = await markAllNotificationsAsReadApiV1AdminNotificationsReadAllPost()
  if (error) throw error
  return data
}

export const deleteAdminNotification = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/admin/notifications/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
  
  return response.json();
}

export const fetchAdminDemoRequests = async (skip: number = 0, limit: number = 50) => {
  const { data, error } = await getAllDemoRequestsApiV1AdminDemoRequestsGet({ query: { skip, limit } })
  if (error) throw error
  return data
}

export const updateAdminDemoRequestStatus = async (id: string, status: string) => {
  const { data, error } = await updateDemoRequestStatusApiV1AdminDemoRequestsReqIdPatch({ path: { req_id: id }, body: { status } })
  if (error) throw error
  return data
}

export const deleteAdminDemoRequest = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/admin/demo-requests/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete demo request');
  }
  
  return response.json();
}

export const updateUserRole = async (userId: string, newRole: string) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ role: newRole })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user role');
  }
  
  return response.json();
}

export const createUser = async (payload: any) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create user');
  }
  
  return response.json();
}

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ is_active: isActive })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update user status');
  }
  
  return response.json();
}

export const resetUserPassword = async (userId: string, newPassword: string) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ new_password: newPassword })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to reset password');
  }
  
  return response.json();
}
