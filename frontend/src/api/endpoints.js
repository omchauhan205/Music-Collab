import api from './client'

// ---- Auth ----
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
}

// ---- Users ----
export const userApi = {
  musicians: () => api.get('/users/musicians'),
}

// ---- Projects ----
export const projectApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (payload) => api.post('/projects', payload),
  update: (id, payload) => api.put(`/projects/${id}`, payload),
  remove: (id) => api.delete(`/projects/${id}`),
  addMember: (id, email) => api.post(`/projects/${id}/members`, { email }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
}

// ---- Music files ----
export const fileApi = {
  list: () => api.get('/files'),
  get: (id) => api.get(`/files/${id}`),
  upload: (formData, onProgress) =>
    api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  update: (id, payload) => api.put(`/files/${id}`, payload),
  remove: (id) => api.delete(`/files/${id}`),
  versions: (id) => api.get(`/files/${id}/versions`),
  addVersion: (id, formData, onProgress) =>
    api.post(`/files/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  comments: (id) => api.get(`/files/${id}/comments`),
  addComment: (id, text) => api.post(`/files/${id}/comments`, { text }),
  downloadUrl: (id, versionId) =>
    `${api.defaults.baseURL}/files/${id}/download${versionId ? `?versionId=${versionId}` : ''}`,
}

// ---- Portfolio ----
export const portfolioApi = {
  list: () => api.get('/portfolio'),
  create: (payload) => api.post('/portfolio', payload),
  update: (id, payload) => api.put(`/portfolio/${id}`, payload),
  remove: (id) => api.delete(`/portfolio/${id}`),
  publicByUser: (userId) => api.get(`/public/portfolio/${userId}`),
}

// ---- Notifications ----
export const notificationApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
}

// ---- Dashboards ----
export const dashboardApi = {
  musician: () => api.get('/dashboard'),
  admin: () => api.get('/admin/dashboard'),
}

// ---- Admin ----
export const adminApi = {
  users: () => api.get('/admin/users'),
  createUser: (payload) => api.post('/admin/users', payload),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  pendingFiles: () => api.get('/admin/moderation/files'),
  pendingComments: () => api.get('/admin/moderation/comments'),
  moderateFile: (id, payload) => api.patch(`/admin/moderation/files/${id}`, payload),
  moderateComment: (id, payload) => api.patch(`/admin/moderation/comments/${id}`, payload),
  settings: () => api.get('/admin/settings'),
  updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { settingValue: value }),
  activity: () => api.get('/admin/activity'),
  projects: () => api.get('/admin/projects'),
}

// ---- Public ----
export const publicApi = {
  musicians: () => api.get('/public/musicians'),
  musician: (id) => api.get(`/public/musicians/${id}`),
}
