export default function MarkdownReadme({ html }) {
  if (!html) return null;
  return (
    <div className="readme-body card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800/60 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span className="text-sm font-medium text-gray-300">README.md</span>
      </div>
      <div
        className="github-readme px-6 py-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
