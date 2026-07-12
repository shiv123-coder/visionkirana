export const fetchUserNotifications = async (skip: number = 0, limit: number = 50) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/users/me/notifications?skip=${skip}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user notifications');
  }
  
  return response.json();
}

export const markUserNotificationAsRead = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/users/me/notifications/${id}/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  
  return response.json();
}

export const markAllUserNotificationsAsRead = async () => {
  const token = localStorage.getItem("access_token");
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/users/me/notifications/read-all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
  
  return response.json();
}
