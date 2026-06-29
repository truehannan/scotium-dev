import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { rust } from '@codemirror/lang-rust';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { fetchRepoContents, fetchRepoBranches, createPullRequest, createOrUpdateFile, createBranch, fetchRepo } from '../utils/github';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/ui/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LANG_MAP = { js: javascript, jsx: () => javascript({ jsx: true }), ts: () => javascript({ typescript: true }), tsx: () => javascript({ jsx: true, typescript: true }), py: python, html, css, json, rs: rust, java, cpp, c: cpp, h: cpp };

function getLangExt(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const factory = LANG_MAP[ext];
  return factory ? (typeof factory === 'function' ? factory() : factory()) : javascript();
}

export default function RepoEditorPage() {
  const { owner, repo } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [currentPath, setCurrentPath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [fileSha, setFileSha] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [commitMsg, setCommitMsg] = useState('');
  const [prTitle, setPrTitle] = useState('');
  const [prBody, setPrBody] = useState('');
  const [showPRModal, setShowPRModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: repoData } = useQuery({ queryKey: ['repo', owner, repo], queryFn: () => fetchRepo(owner, repo, token) });
  const { data: branches } = useQuery({ queryKey: ['branches', owner, repo], queryFn: () => fetchRepoBranches(owner, repo, token), enabled: !!token });
  const { data: contents, refetch: refetchContents } = useQuery({
    queryKey: ['editor-contents', owner, repo, currentPath, selectedBranch],
    queryFn: () => fetchRepoContents(owner, repo, currentPath, selectedBranch, token),
    enabled: !!token,
  });

  useEffect(() => { if (repoData && !selectedBranch) setSelectedBranch(repoData.default_branch); }, [repoData]);

  const openFile = async (file) => {
    if (file.type === 'dir') { setCurrentPath(file.path); return; }
    try {
      const data = await fetchRepoContents(owner, repo, file.path, selectedBranch, token);
      const decoded = atob(data.content.replace(/\n/g, ''));
      setFileContent(decoded);
      setOriginalContent(decoded);
      setFileSha(data.sha);
      setCurrentPath(file.path);
    } catch (e) { setError('Failed to load file'); }
  };

  const goUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    if (Array.isArray(contents)) { setCurrentPath(parts.join('/')); }
    else { setCurrentPath(parts.slice(0, -1).join('/')); setFileContent(''); setOriginalContent(''); }
  };

  const isModified = fileContent !== originalContent;

  const handleCommit = async () => {
    if (!commitMsg.trim()) { setError('Commit message required'); return; }
    setSaving(true); setError('');
    try {
      const targetBranch = newBranch || selectedBranch;
      if (newBranch) {
        const baseBranch = branches?.find(b => b.name === selectedBranch);
        if (baseBranch) await createBranch(owner, repo, newBranch, baseBranch.commit.sha, token);
      }
      await createOrUpdateFile(owner, repo, currentPath, commitMsg, fileContent, targetBranch, fileSha, token);
      setSuccess('File committed successfully!');
      setOriginalContent(fileContent);
      if (newBranch) { setSelectedBranch(newBranch); setNewBranch(''); }
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || 'Failed to commit'); }
    finally { setSaving(false); }
  };

  const handleCreatePR = async () => {
    if (!prTitle.trim()) { setError('PR title required'); return; }
    setSaving(true); setError('');
    try {
      const base = repoData?.default_branch || 'main';
      const head = newBranch || selectedBranch;
      const pr = await createPullRequest(owner, repo, prTitle, head, base, prBody, token);
      setSuccess(`PR #${pr.number} created!`);
      setShowPRModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || 'Failed to create PR'); }
    finally { setSaving(false); }
  };

  if (!token || !user) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Sign in Required</h2>
      <p className="text-gray-400">You need to sign in with GitHub to use the editor.</p>
      <Link to={`/${owner}/${repo}`} className="btn-outline mt-4 inline-block text-sm">← Back to repo</Link>
    </div>
  );

  const isDir = Array.isArray(contents);
  const isFile = !isDir && fileContent;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <SEO title={`Editor - ${owner}/${repo}`} canonical={`/${owner}/${repo}/editor`} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to={`/${owner}/${repo}`} className="text-sm text-gray-500 hover:text-secondary">← {owner}/{repo}</Link>
          <select value={selectedBranch} onChange={e => { setSelectedBranch(e.target.value); setCurrentPath(''); setFileContent(''); }} className="input-field text-xs py-1.5">
            {branches?.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {isModified && (
            <>
              <input value={newBranch} onChange={e => setNewBranch(e.target.value)} placeholder="New branch (optional)" className="input-field text-xs py-1.5 w-44" />
              <input value={commitMsg} onChange={e => setCommitMsg(e.target.value)} placeholder="Commit message" className="input-field text-xs py-1.5 w-52" />
              <button onClick={handleCommit} disabled={saving} className="btn-primary text-xs py-1.5 px-3">{saving ? '...' : 'Commit'}</button>
            </>
          )}
          <button onClick={() => setShowPRModal(true)} className="btn-outline text-xs py-1.5 px-3">Create PR</button>
        </div>
      </div>

      {error && <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>}
      {success && <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File tree */}
        <div className="card lg:col-span-1 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-mono truncate">{currentPath || '/'}</span>
            {currentPath && <button onClick={goUp} className="text-xs text-secondary hover:underline">↑ Up</button>}
          </div>
          {isDir && contents.sort((a, b) => (a.type === 'dir' ? -1 : 1) - (b.type === 'dir' ? -1 : 1)).map(item => (
            <button key={item.sha} onClick={() => openFile(item)} className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] text-xs text-gray-300">
              <span>{item.type === 'dir' ? '📁' : '📄'}</span>
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {isFile ? (
            <div className="rounded-xl overflow-hidden border border-gray-800/60">
              <div className="bg-primary-light px-3 py-2 border-b border-gray-800/40 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">{currentPath}</span>
                {isModified && <span className="badge bg-yellow-500/10 text-yellow-400">Modified</span>}
              </div>
              <CodeMirror
                value={fileContent}
                height="500px"
                theme={oneDark}
                extensions={[getLangExt(currentPath)]}
                onChange={setFileContent}
                basicSetup={{ lineNumbers: true, foldGutter: true, bracketMatching: true, closeBrackets: true }}
              />
            </div>
          ) : (
            <div className="card text-center py-16 text-gray-500 text-sm">Select a file to edit</div>
          )}
        </div>
      </div>

      {/* PR Modal */}
      {showPRModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">Create Pull Request</h3>
            <div className="space-y-3">
              <input value={prTitle} onChange={e => setPrTitle(e.target.value)} placeholder="PR Title" className="input-field w-full" />
              <textarea value={prBody} onChange={e => setPrBody(e.target.value)} placeholder="Description (optional)" rows={4} className="input-field w-full resize-none" />
              <div className="text-xs text-gray-500">
                <span className="font-medium text-secondary">{newBranch || selectedBranch}</span> → <span className="font-medium text-white">{repoData?.default_branch || 'main'}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowPRModal(false)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleCreatePR} disabled={saving} className="btn-primary text-sm">{saving ? 'Creating...' : 'Create PR'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
