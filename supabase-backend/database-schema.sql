-- Travel Explorer Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places table
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category TEXT,
  image_url TEXT,
  wikipedia_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  place_id UUID REFERENCES places(id),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Post likes table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family trips table
CREATE TABLE family_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Site settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  social_links JSONB,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_places_location ON places USING gist (point(longitude, latitude));
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_place_id ON posts(place_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_place_id ON favorites(place_id);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
('app_name', '"Travel Explorer"'),
('app_description', '"Discover Egypt like never before"'),
('maintenance_mode', 'false'),
('max_upload_size', '10485760'), -- 10MB
('allowed_file_types', '["image/jpeg", "image/png", "image/webp"]');

-- Insert sample places
INSERT INTO places (name_en, name_ar, description, latitude, longitude, category) VALUES
('Pyramids of Giza', 'أهرامات الجيزة', 'The Great Pyramids of Giza are the only remaining wonder of the Seven Wonders of the Ancient World.', 29.9792345, 31.1342019, 'historical'),
('Valley of the Kings', 'وادي الملوك', 'Ancient Egyptian burial ground for pharaohs and nobles.', 25.7402, 32.6014, 'historical'),
('Karnak Temple', 'معبد الكرنك', 'The largest temple complex ever built by man.', 25.7188, 32.6573, 'historical'),
('Abu Simbel', 'أبو سمبل', 'Massive temple complex built by Ramses II.', 22.3372, 31.6258, 'historical'),
('Khan el-Khalili', 'خان الخليلي', 'Historic bazaar and souq district in Islamic Cairo.', 30.0478, 31.2625, 'cultural'),
('Coptic Cairo', 'القاهرة القبطية', 'Ancient Christian district with historic churches.', 30.0074, 31.2300, 'cultural'),
('Citadel of Saladin', 'قلعة صلاح الدين', 'Medieval Islamic fortification in Cairo.', 30.0297, 31.2614, 'historical'),
('Egyptian Museum', 'المتحف المصري', 'Home to the world''s largest collection of ancient Egyptian artifacts.', 30.0478, 31.2336, 'museum');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic setup - you may want to customize these)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view places" ON places FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create places" ON places FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
-- (Add more policies as needed for your specific requirements)