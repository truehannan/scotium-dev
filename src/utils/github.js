import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

export function getHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchTrendingRepos({ language = '', since = 'weekly', sort = 'stars', page = 1, perPage = 30, token = null }) {
  let query = 'stars:>100';
  if (language) query += ` language:${language}`;

  const dateMap = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  };
  const days = dateMap[since] || 7;
  const date = new Date();
  date.setDate(date.getDate() - days);
  query += ` created:>${date.toISOString().split('T')[0]}`;

  const res = await axios.get(`${GITHUB_API}/search/repositories`, {
    params: { q: query, sort, order: 'desc', per_page: perPage, page },
    headers: getHeaders(token),
  });
  return res.data;
}

export async function fetchUser(username, token = null) {
  const res = await axios.get(`${GITHUB_API}/users/${username}`, {
    headers: getHeaders(token),
  });
  return res.data;
}

export async function fetchUserRepos(username, page = 1, perPage = 30, sort = 'updated', token = null) {
  const res = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
    params: { sort, per_page: perPage, page, direction: 'desc' },
    headers: getHeaders(token),
  });
  return res.data;
}

export async function fetchUserOrgs(username, token = null) {
  const res = await axios.get(`${GITHUB_API}/users/${username}/orgs`, {
    headers: getHeaders(token),
  });
  return res.data;
}

export async function fetchOrg(orgname, token = null) {
  const res = await axios.get(`${GITHUB_API}/orgs/${orgname}`, {
    headers: getHeaders(token),
  });
  return res.data;
}

export async function fetchOrgRepos(orgname, page = 1, perPage = 30, token = null) {
  const res = await axios.get(`${GITHUB_API}/orgs/${orgname}/repos`, {
    params: { sort: 'updated', per_page: perPage, page, direction: 'desc' },
    headers: getHeaders(token),
  });
  return res.data;
}

export async function fetchOrgMembers(orgname, token = null) {
  const res = await axios.get(`${GITHUB_API}/orgs/${orgname}/members`, {
    params: { per_page: 20 },
    headers: getHeaders(token),
  });
  return res.data;
}

export async function searchRepos(query, sort = 'stars', page = 1, perPage = 30, token = null) {
  const res = await axios.get(`${GITHUB_API}/search/repositories`, {
    params: { q: query, sort, order: 'desc', per_page: perPage, page },
    headers: getHeaders(token),
  });
  return res.data;
}

export async function searchUsers(query, page = 1, perPage = 30, token = null) {
  const res = await axios.get(`${GITHUB_API}/search/users`, {
    params: { q: query, per_page: perPage, page },
    headers: getHeaders(token),
  });
  return res.data;
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

export const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go',
  'Rust', 'C++', 'C', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'Dart', 'C#', 'Scala',
];

export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  'C#': '#178600',
  Scala: '#c22d40',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};
