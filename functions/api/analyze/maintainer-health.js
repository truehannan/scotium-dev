// Maintainer Health Score — Workers AI Sentiment Analysis
// Rate limit: 3 requests per authenticated user per day
// Caches results in D1 (expires after 24 hours)

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonResponse({ error: 'Authentication required. Sign in to analyze repos.' }, 401);
    }

    // Get authenticated user
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    const user = await userRes.json();
    if (!user.login) return jsonResponse({ error: 'Invalid token' }, 401);

    const { owner, repo } = await request.json();
    if (!owner || !repo) return jsonResponse({ error: 'Missing owner or repo' }, 400);

    // Check D1 cache first
    const cacheKey = `${owner}/${repo}`;
    try {
      const cached = await env.DB.prepare(
        'SELECT * FROM maintainer_health WHERE owner = ? AND repo = ? AND expires_at > datetime("now")'
      ).bind(owner, repo).first();

      if (cached) {
        return jsonResponse({
          score: cached.score,
          trend: cached.trend,
          burnout_risk: cached.burnout_risk === 1,
          commit_count: cached.commit_count,
          positive_ratio: cached.positive_ratio,
          commits: JSON.parse(cached.commits_json || '[]'),
          cached: true,
        });
      }
    } catch (e) {
      // D1 may not be set up yet, continue without cache
    }

    // Rate limit check: 3 requests per user per day
    try {
      const today = new Date().toISOString().split('T')[0];
      const usage = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM health_usage WHERE username = ? AND date = ?'
      ).bind(user.login, today).first();

      if (usage && usage.count >= 3) {
        return jsonResponse({ error: 'Rate limit reached. Maximum 3 analyses per day.' }, 429);
      }

      // Record usage
      await env.DB.prepare(
        'INSERT INTO health_usage (username, date) VALUES (?, ?)'
      ).bind(user.login, today).run();
    } catch (e) {
      // D1 not ready, allow request but don't track
    }

    // Fetch commits from GitHub (last 90 days)
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=100`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
    );

    if (!commitsRes.ok) return jsonResponse({ error: 'Failed to fetch commits. Repo may not exist.' }, 404);
    const commits = await commitsRes.json();

    if (!commits.length) {
      return jsonResponse({ score: 1, trend: 'declining', burnout_risk: true, commit_count: 0, positive_ratio: 0, commits: [] });
    }

    // Analyze sentiment with Workers AI
    const messages = commits.slice(0, 30).map(c => c.commit.message.split('\n')[0].slice(0, 100));
    let sentiments = [];

    try {
      // Use Workers AI for sentiment analysis
      const aiResults = await Promise.all(
        messages.map(async (msg) => {
          try {
            const result = await env.AI.run('@cf/huggingface/distilbert-sst-2-int8', { text: msg });
            // result is array of [{label, score}]
            const positive = result.find(r => r.label === 'POSITIVE');
            return { message: msg, sentiment: positive && positive.score > 0.6 ? 'positive' : positive && positive.score < 0.4 ? 'negative' : 'neutral', score: positive?.score || 0.5 };
          } catch {
            // Fallback: keyword-based sentiment
            return { message: msg, sentiment: classifyFallback(msg), score: 0.5 };
          }
        })
      );
      sentiments = aiResults;
    } catch {
      // Full fallback if AI is unavailable
      sentiments = messages.map(msg => ({ message: msg, sentiment: classifyFallback(msg), score: 0.5 }));
    }

    // Calculate score
    const positiveCount = sentiments.filter(s => s.sentiment === 'positive').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'negative').length;
    const positiveRatio = sentiments.length > 0 ? positiveCount / sentiments.length : 0.5;

    // Commit frequency trend (compare first half vs second half of 90 days)
    const midDate = new Date();
    midDate.setDate(midDate.getDate() - 45);
    const recentCommits = commits.filter(c => new Date(c.commit.author.date) > midDate).length;
    const olderCommits = commits.length - recentCommits;
    const trend = recentCommits > olderCommits * 1.2 ? 'rising' : recentCommits < olderCommits * 0.7 ? 'declining' : 'stable';

    // Days since last commit
    const daysSince = Math.floor((Date.now() - new Date(commits[0].commit.author.date)) / 86400000);

    // Final score (1-10)
    let score = 5;
    score += (positiveRatio - 0.5) * 4; // sentiment adds/subtracts up to 2
    score += trend === 'rising' ? 1.5 : trend === 'declining' ? -1.5 : 0;
    score += daysSince < 3 ? 1.5 : daysSince < 7 ? 0.5 : daysSince < 30 ? -0.5 : -2;
    score += commits.length > 50 ? 1 : commits.length > 20 ? 0.5 : commits.length < 5 ? -1 : 0;
    score = Math.max(1, Math.min(10, Math.round(score)));

    const burnoutRisk = score <= 3 || (trend === 'declining' && negativeCount > positiveCount);

    const result = {
      score,
      trend,
      burnout_risk: burnoutRisk,
      commit_count: commits.length,
      positive_ratio: positiveRatio,
      commits: sentiments.slice(0, 10).map((s, i) => ({
        message: s.message,
        sentiment: s.sentiment,
        date: commits[i]?.commit?.author?.date,
      })),
    };

    // Cache in D1
    try {
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);
      await env.DB.prepare(
        `INSERT OR REPLACE INTO maintainer_health (id, owner, repo, score, trend, burnout_risk, commit_count, positive_ratio, commits_json, analyzed_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`
      ).bind(cacheKey, owner, repo, score, trend, burnoutRisk ? 1 : 0, commits.length, positiveRatio, JSON.stringify(result.commits), expires.toISOString()).run();
    } catch (e) {
      // Cache write failed, non-critical
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: 'Analysis failed: ' + err.message }, 500);
  }
}

function classifyFallback(msg) {
  const lower = msg.toLowerCase();
  const negWords = ['fix', 'bug', 'broken', 'hack', 'workaround', 'revert', 'hotfix', 'urgent', 'terrible', 'awful', 'crap', 'damn', 'ugh', 'painful', 'nightmare'];
  const posWords = ['feat', 'add', 'improve', 'enhance', 'update', 'new', 'implement', 'refactor', 'clean', 'optimize', 'great', 'awesome', 'nice', 'complete'];
  const hasNeg = negWords.some(w => lower.includes(w));
  const hasPos = posWords.some(w => lower.includes(w));
  if (hasPos && !hasNeg) return 'positive';
  if (hasNeg && !hasPos) return 'negative';
  return 'neutral';
}

function jsonResponse(data, status = 200) {
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
