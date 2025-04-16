-- Tabela para armazenar posts do blog
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, archived
  author TEXT NOT NULL,
  author_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  category TEXT NOT NULL,
  reading_time INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0
);

-- Índices para consultas eficientes
CREATE INDEX blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX blog_posts_status_idx ON blog_posts(status);
CREATE INDEX blog_posts_category_idx ON blog_posts(category);
CREATE INDEX blog_posts_featured_idx ON blog_posts(featured);

-- Tabela para armazenar categorias
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar o contador de posts por categoria
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for INSERT ou UPDATE com alteração na categoria
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.category <> NEW.category) THEN
    -- Incrementa contagem na nova categoria se o post está publicado
    IF NEW.status = 'published' THEN
      UPDATE blog_categories SET post_count = post_count + 1 WHERE name = NEW.category;
    END IF;
    
    -- Se for UPDATE, decrementa contagem na categoria antiga se o post estava publicado
    IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
      UPDATE blog_categories SET post_count = post_count - 1 WHERE name = OLD.category;
    END IF;
  END IF;
  
  -- Se for UPDATE com alteração no status
  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    -- Post foi publicado
    IF NEW.status = 'published' THEN
      UPDATE blog_categories SET post_count = post_count + 1 WHERE name = NEW.category;
    -- Post foi despublicado
    ELSIF OLD.status = 'published' THEN
      UPDATE blog_categories SET post_count = post_count - 1 WHERE name = NEW.category;
    END IF;
  END IF;
  
  -- Se for DELETE
  IF TG_OP = 'DELETE' THEN
    -- Decrementa contagem se o post estava publicado
    IF OLD.status = 'published' THEN
      UPDATE blog_categories SET post_count = post_count - 1 WHERE name = OLD.category;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela de posts
CREATE TRIGGER blog_posts_category_count
AFTER INSERT OR UPDATE OR DELETE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Tabela para armazenar o calendário editorial
CREATE TABLE blog_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in_progress, ready, published
  assigned_to TEXT,
  post_id UUID REFERENCES blog_posts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para estatísticas de posts
CREATE TABLE blog_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0, -- em segundos
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Política RLS para acesso aos posts
CREATE POLICY "Public can read published posts" 
ON blog_posts FOR SELECT 
USING (status = 'published');

CREATE POLICY "Public can read categories" 
ON blog_categories FOR SELECT 
TO PUBLIC;

-- Politicas RLS para administradores gerenciarem posts
CREATE POLICY "Authenticated users can manage posts" 
ON blog_posts FOR ALL 
TO authenticated;

CREATE POLICY "Authenticated users can manage categories" 
ON blog_categories FOR ALL 
TO authenticated;

CREATE POLICY "Authenticated users can manage calendar" 
ON blog_calendar FOR ALL 
TO authenticated;

CREATE POLICY "Authenticated users can manage stats" 
ON blog_stats FOR ALL 
TO authenticated; 