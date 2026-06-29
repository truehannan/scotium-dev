-- Scotium D1 Database Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_username TEXT UNIQUE NOT NULL,
  github_id INTEGER UNIQUE NOT NULL,
  access_token TEXT,
  profile_pic TEXT,
  bio TEXT,
  email TEXT,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  repo_description TEXT,
  repo_stars INTEGER DEFAULT 0,
  repo_language TEXT,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CMS Tables

CREATE TABLE IF NOT EXISTS cms_announcements (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  link TEXT,
  bg_color TEXT DEFAULT 'linear-gradient(90deg, #10b981, #06b6d4)',
  text_color TEXT DEFAULT '#ffffff',
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_banners (
  id TEXT PRIMARY KEY,
  slot TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  bg_color TEXT DEFAULT '#0a0e27',
  badge TEXT,
  cta TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_sponsored_repos (
  id TEXT PRIMARY KEY,
  repo_path TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_github_username ON users(github_username);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_cms_announcements_active ON cms_announcements(active);
CREATE INDEX IF NOT EXISTS idx_cms_banners_slot ON cms_banners(slot, active);
CREATE INDEX IF NOT EXISTS idx_cms_sponsored_active ON cms_sponsored_repos(active);
