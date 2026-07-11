// Real AI-powered Project Intelligence Analysis
// Uses Cloudflare Workers AI (Llama 3.1 8B)
// Rate limit: 3 per authenticated user per day
// Results cached in D1 for 24 hours

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json({ error: 'Authentication required. Sign in to use AI analysis.', code: 'AUTH_REQUIRED' }, 401);
    }

    // Verify user
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    const user = await userRes.json();
    if (!user.login) return json({ error: 'Invalid token' }, 401);

    const { owner, repo, repoContext } = await request.json();
    if (!owner || !repo || !repoContext) return json({ error: 'Missing required fields' }, 400);

    const cacheKey = `${owner}/${repo}`;

    // Check D1 cache (24h TTL)
    try {
      const cached = await env.DB.prepare(
        'SELECT result_json FROM ai_analysis_cache WHERE id = ? AND expires_at > datetime("now")'
      ).bind(cacheKey).first();
      if (cached) return json(JSON.parse(cached.result_json));
    } catch (e) { /* D1 not ready, continue */ }

    // Rate limit: 3/day/user
    try {
      const today = new Date().toISOString().split('T')[0];
      const usage = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM ai_usage WHERE username = ? AND date = ?'
      ).bind(user.login, today).first();
      if (usage && usage.count >= 3) {
        return json({ error: 'Daily limit reached (3 analyses per day). Results are cached — try a previously analyzed repo.', code: 'RATE_LIMIT' }, 429);
      }
      await env.DB.prepare('INSERT INTO ai_usage (username, date) VALUES (?, ?)').bind(user.login, today).run();
    } catch (e) { /* D1 not ready, allow */ }

    // Build the AI prompt
    const systemPrompt = `You are a senior software engineering consultant analyzing a GitHub repository. Provide actionable, specific analysis in valid JSON format only. No markdown, no explanation outside JSON.

Output this exact JSON structure:
{
  "score": <number 1-10>,
  "trend": "<rising|stable|declining>",
  "burnout": <true|false>,
  "health": ["<insight1>", "<insight2>", "<insight3>"],
  "roadmap": [{"title": "<step>", "detail": "<explanation>"}],
  "issues": [{"title": "<issue title with [Category] prefix>", "body": "<detailed issue body>"}],
  "commitPlan": [{"title": "<conventional commit message>", "detail": "<what this commit does>"}],
  "fileInsights": [{"file": "<filename or path>", "insight": "<specific actionable advice>"}],
  "calendar": [{"title": "<task>", "detail": "<description>", "daysFromNow": <number>}],
  "security": [{"label": "<check item>", "pass": <true|false>}],
  "growth": [{"title": "<strategy>", "detail": "<how to implement>"}]
}

Rules:
- Score 1-10 based on: commit recency, frequency, contributor count, issue health, documentation
- Health insights: 3 sentences about maintainer engagement, development patterns, project trajectory
- Roadmap: 5-7 prioritized next steps based on what's MISSING in the repo
- Issues: 3-4 issues the maintainer should create, with [Category] prefix and detailed body
- Commit plan: 6-8 sequential commits to improve the project
- File insights: 4-6 specific files/directories with what needs attention
- Calendar: 4-5 tasks with deadlines (daysFromNow: 1-14)
- Security: 6-8 items checking for LICENSE, SECURITY.md, CI, tests, secrets, containers
- Growth: 5-6 specific strategies to increase stars and contributors
- Be SPECIFIC to this repo — mention the language, tools, actual file names, actual numbers
- All text should be professional, clear, and immediately actionable`;

    const userPrompt = `Analyze this GitHub repository:

Repository: ${owner}/${repo}
Description: ${repoContext.description || 'No description'}
Language: ${repoContext.language || 'Unknown'}
Stars: ${repoContext.stars || 0}
Forks: ${repoContext.forks || 0}
Open Issues: ${repoContext.issues || 0}
Contributors: ${repoContext.contributors || 0}
Last Commit: ${repoContext.lastCommitDays || '?'} days ago
Commits (last 90 days): ${repoContext.commitCount || 0}
Has License: ${repoContext.hasLicense ? 'Yes' : 'No'}
Has CI/CD: ${repoContext.hasCI ? 'Yes' : 'No'}
Has Tests: ${repoContext.hasTests ? 'Yes' : 'No'}
Has SECURITY.md: ${repoContext.hasSecurity ? 'Yes' : 'No'}
Has CONTRIBUTING.md: ${repoContext.hasContributing ? 'Yes' : 'No'}
Has Dockerfile: ${repoContext.hasDocker ? 'Yes' : 'No'}
Has CHANGELOG: ${repoContext.hasChangelog ? 'Yes' : 'No'}
Root files: ${(repoContext.rootFiles || []).join(', ')}
Recent commit messages (last 10):
${(repoContext.recentCommits || []).map((m, i) => `${i + 1}. ${m}`).join('\n')}

Provide your analysis as JSON only.`;

    // Call Workers AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    let result;
    try {
      // Extract JSON from response
      let text = aiResponse.response || '';
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseErr) {
      // If AI response isn't valid JSON, return error
      return json({ error: 'AI generated invalid response. Please try again.', code: 'AI_PARSE_ERROR' }, 500);
    }

    // Validate required fields
    if (!result.score || !result.health) {
      return json({ error: 'AI response incomplete. Please try again.', code: 'AI_INCOMPLETE' }, 500);
    }

    // Ensure score is in range
    result.score = Math.max(1, Math.min(10, Math.round(result.score)));

    // Cache in D1 (24h)
    try {
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);
      await env.DB.prepare(
        `INSERT OR REPLACE INTO ai_analysis_cache (id, result_json, generated_at, expires_at) VALUES (?, ?, datetime('now'), ?)`
      ).bind(cacheKey, JSON.stringify(result), expires.toISOString()).run();
    } catch (e) { /* Cache write failed, non-critical */ }

    return json(result);
  } catch (err) {
    return json({ error: 'Analysis failed: ' + (err.message || 'Unknown error'), code: 'INTERNAL' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  });
}
