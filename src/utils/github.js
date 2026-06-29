import axios from 'axios';
const API = 'https://api.github.com';

export const headers = (token) => {
  const h = { Accept: 'application/vnd.github.v3+json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

// Repos
export const fetchTrending = ({ language = '', since = 'weekly', sort = 'stars', page = 1, perPage = 30, token }) => {
  let q = 'stars:>50';
  if (language) q += ` language:${language}`;
  const days = { daily: 1, weekly: 7, monthly: 30 }[since] || 7;
  const d = new Date(); d.setDate(d.getDate() - days);
  q += ` created:>${d.toISOString().split('T')[0]}`;
  return axios.get(`${API}/search/repositories`, { params: { q, sort, order: 'desc', per_page: perPage, page }, headers: headers(token) }).then(r => r.data);
};

export const searchRepos = (q, sort = 'stars', page = 1, perPage = 30, token) =>
  axios.get(`${API}/search/repositories`, { params: { q, sort, order: 'desc', per_page: perPage, page }, headers: headers(token) }).then(r => r.data);

export const searchUsers = (q, page = 1, perPage = 30, token) =>
  axios.get(`${API}/search/users`, { params: { q, per_page: perPage, page }, headers: headers(token) }).then(r => r.data);

export const searchCode = (q, lang = '', page = 1, perPage = 30, token) => {
  let query = q;
  if (lang) query += ` language:${lang}`;
  return axios.get(`${API}/search/code`, { params: { q: query, per_page: perPage, page }, headers: headers(token) }).then(r => r.data);
};

// Users
export const fetchUser = (username, token) => axios.get(`${API}/users/${username}`, { headers: headers(token) }).then(r => r.data);
export const fetchUserRepos = (username, sort = 'updated', page = 1, perPage = 30, token) =>
  axios.get(`${API}/users/${username}/repos`, { params: { sort, per_page: perPage, page, direction: 'desc' }, headers: headers(token) }).then(r => r.data);
export const fetchUserOrgs = (username, token) => axios.get(`${API}/users/${username}/orgs`, { headers: headers(token) }).then(r => r.data);
export const fetchUserEvents = (username, page = 1, token) =>
  axios.get(`${API}/users/${username}/events`, { params: { per_page: 30, page }, headers: headers(token) }).then(r => r.data);

// Auth user
export const fetchAuthUser = (token) => axios.get(`${API}/user`, { headers: headers(token) }).then(r => r.data);
export const fetchAuthRepos = (sort = 'updated', page = 1, perPage = 50, token) =>
  axios.get(`${API}/user/repos`, { params: { sort, per_page: perPage, page, direction: 'desc', affiliation: 'owner,collaborator,organization_member' }, headers: headers(token) }).then(r => r.data);
export const fetchUserIssues = (token) =>
  axios.get(`${API}/issues`, { params: { filter: 'all', state: 'open', per_page: 20, sort: 'updated' }, headers: headers(token) }).then(r => r.data);

// Orgs
export const fetchOrg = (org, token) => axios.get(`${API}/orgs/${org}`, { headers: headers(token) }).then(r => r.data);
export const fetchOrgRepos = (org, page = 1, perPage = 30, token) =>
  axios.get(`${API}/orgs/${org}/repos`, { params: { sort: 'updated', per_page: perPage, page }, headers: headers(token) }).then(r => r.data);
export const fetchOrgMembers = (org, token) => axios.get(`${API}/orgs/${org}/members`, { params: { per_page: 30 }, headers: headers(token) }).then(r => r.data);

// Repo detail
export const fetchRepo = (owner, repo, token) => axios.get(`${API}/repos/${owner}/${repo}`, { headers: headers(token) }).then(r => r.data);
export const fetchRepoReadme = (owner, repo, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/readme`, { headers: { ...headers(token), Accept: 'application/vnd.github.html' } }).then(r => r.data).catch(() => null);
export const fetchRepoContents = (owner, repo, path = '', ref = '', token) =>
  axios.get(`${API}/repos/${owner}/${repo}/contents/${path}`, { params: ref ? { ref } : {}, headers: headers(token) }).then(r => r.data);
export const fetchRepoIssues = (owner, repo, state = 'open', page = 1, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/issues`, { params: { state, per_page: 30, page, sort: 'updated' }, headers: headers(token) }).then(r => r.data);
export const fetchRepoPulls = (owner, repo, state = 'open', page = 1, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/pulls`, { params: { state, per_page: 30, page, sort: 'updated' }, headers: headers(token) }).then(r => r.data);
export const fetchRepoBranches = (owner, repo, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/branches`, { params: { per_page: 50 }, headers: headers(token) }).then(r => r.data);
export const fetchRepoContributors = (owner, repo, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/contributors`, { params: { per_page: 30 }, headers: headers(token) }).then(r => r.data);
export const fetchRepoCommits = (owner, repo, page = 1, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/commits`, { params: { per_page: 30, page }, headers: headers(token) }).then(r => r.data);
export const fetchRepoLanguages = (owner, repo, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/languages`, { headers: headers(token) }).then(r => r.data);
export const fetchRepoReleases = (owner, repo, token) =>
  axios.get(`${API}/repos/${owner}/${repo}/releases`, { params: { per_page: 10 }, headers: headers(token) }).then(r => r.data);

// Repo mutations (authenticated)
export const createPullRequest = (owner, repo, title, head, base, body, token) =>
  axios.post(`${API}/repos/${owner}/${repo}/pulls`, { title, head, base, body }, { headers: headers(token) }).then(r => r.data);
export const createOrUpdateFile = (owner, repo, path, message, content, branch, sha, token) =>
  axios.put(`${API}/repos/${owner}/${repo}/contents/${path}`, { message, content: btoa(content), branch, ...(sha ? { sha } : {}) }, { headers: headers(token) }).then(r => r.data);
export const createBranch = (owner, repo, branchName, fromSha, token) =>
  axios.post(`${API}/repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${branchName}`, sha: fromSha }, { headers: headers(token) }).then(r => r.data);

// Helpers
export const formatDate = (str) => {
  const d = Math.floor((Date.now() - new Date(str)) / 86400000);
  if (d === 0) return 'Today'; if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`; if (d < 30) return `${Math.floor(d/7)}w ago`;
  if (d < 365) return `${Math.floor(d/30)}mo ago`; return `${Math.floor(d/365)}y ago`;
};
export const formatNum = (n) => { if (!n) return '0'; if (n>=1e6) return `${(n/1e6).toFixed(1)}M`; if (n>=1e3) return `${(n/1e3).toFixed(1)}k`; return String(n); };

export const LANGUAGES = ['JavaScript','TypeScript','Python','Java','Go','Rust','C++','C','Ruby','PHP','Swift','Kotlin','Dart','C#','Scala'];
export const LANG_COLORS = {JavaScript:'#f1e05a',TypeScript:'#3178c6',Python:'#3572A5',Java:'#b07219',Go:'#00ADD8',Rust:'#dea584','C++':'#f34b7d',C:'#555555',Ruby:'#701516',PHP:'#4F5D95',Swift:'#F05138',Kotlin:'#A97BFF',Dart:'#00B4AB','C#':'#178600',Scala:'#c22d40',HTML:'#e34c26',CSS:'#563d7c',Shell:'#89e051',Vue:'#41b883'};
