-- Create blog tables if they don't exist
CREATE OR REPLACE FUNCTION create_blog_tables()
RETURNS void AS $$
BEGIN
    -- Check if blog_posts table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        -- Create blog_posts table
        CREATE TABLE public.blog_posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            excerpt TEXT,
            featured_image TEXT,
            published BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            published_at TIMESTAMP WITH TIME ZONE,
            author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
        );

        -- Add RLS policies for blog_posts
        ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read published posts
        CREATE POLICY "Anyone can read published posts" 
            ON public.blog_posts FOR SELECT 
            USING (published = true);
            
        -- Only authenticated users can create posts
        CREATE POLICY "Authenticated users can create posts" 
            ON public.blog_posts FOR INSERT 
            TO authenticated 
            WITH CHECK (true);
            
        -- Only post authors and admins can update posts
        CREATE POLICY "Authors and admins can update posts" 
            ON public.blog_posts FOR UPDATE 
            TO authenticated 
            USING (
                author_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
            
        -- Only post authors and admins can delete posts
        CREATE POLICY "Authors and admins can delete posts" 
            ON public.blog_posts FOR DELETE 
            TO authenticated 
            USING (
                author_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    -- Check if blog_categories table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_categories') THEN
        -- Create blog_categories table
        CREATE TABLE public.blog_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add RLS policies for blog_categories
        ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read categories
        CREATE POLICY "Anyone can read categories" 
            ON public.blog_categories FOR SELECT 
            USING (true);
            
        -- Only authenticated users can create categories
        CREATE POLICY "Authenticated users can create categories" 
            ON public.blog_categories FOR INSERT 
            TO authenticated 
            WITH CHECK (true);
            
        -- Only admins can update categories
        CREATE POLICY "Admins can update categories" 
            ON public.blog_categories FOR UPDATE 
            TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
            
        -- Only admins can delete categories
        CREATE POLICY "Admins can delete categories" 
            ON public.blog_categories FOR DELETE 
            TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    -- Check if blog_tags table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_tags') THEN
        -- Create blog_tags table
        CREATE TABLE public.blog_tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add RLS policies for blog_tags
        ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read tags
        CREATE POLICY "Anyone can read tags" 
            ON public.blog_tags FOR SELECT 
            USING (true);
            
        -- Only authenticated users can create tags
        CREATE POLICY "Authenticated users can create tags" 
            ON public.blog_tags FOR INSERT 
            TO authenticated 
            WITH CHECK (true);
            
        -- Only admins can update tags
        CREATE POLICY "Admins can update tags" 
            ON public.blog_tags FOR UPDATE 
            TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
            
        -- Only admins can delete tags
        CREATE POLICY "Admins can delete tags" 
            ON public.blog_tags FOR DELETE 
            TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    -- Check if blog_posts_categories table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts_categories') THEN
        -- Create blog_posts_categories junction table
        CREATE TABLE public.blog_posts_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
            category_id UUID REFERENCES public.blog_categories(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(post_id, category_id)
        );

        -- Add RLS policies for blog_posts_categories
        ALTER TABLE public.blog_posts_categories ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read post-category relationships
        CREATE POLICY "Anyone can read post-category relationships" 
            ON public.blog_posts_categories FOR SELECT 
            USING (true);
            
        -- Only authenticated users can create post-category relationships
        CREATE POLICY "Authenticated users can create post-category relationships" 
            ON public.blog_posts_categories FOR INSERT 
            TO authenticated 
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.blog_posts 
                    WHERE id = post_id AND (
                        author_id = auth.uid() OR 
                        EXISTS (
                            SELECT 1 FROM public.user_roles 
                            WHERE user_id = auth.uid() AND role = 'admin'
                        )
                    )
                )
            );
            
        -- Only post authors and admins can delete post-category relationships
        CREATE POLICY "Authors and admins can delete post-category relationships" 
            ON public.blog_posts_categories FOR DELETE 
            TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.blog_posts 
                    WHERE id = post_id AND (
                        author_id = auth.uid() OR 
                        EXISTS (
                            SELECT 1 FROM public.user_roles 
                            WHERE user_id = auth.uid() AND role = 'admin'
                        )
                    )
                )
            );
    END IF;

    -- Check if blog_posts_tags table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts_tags') THEN
        -- Create blog_posts_tags junction table
        CREATE TABLE public.blog_posts_tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
            tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(post_id, tag_id)
        );

        -- Add RLS policies for blog_posts_tags
        ALTER TABLE public.blog_posts_tags ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read post-tag relationships
        CREATE POLICY "Anyone can read post-tag relationships" 
            ON public.blog_posts_tags FOR SELECT 
            USING (true);
            
        -- Only authenticated users can create post-tag relationships
        CREATE POLICY "Authenticated users can create post-tag relationships" 
            ON public.blog_posts_tags FOR INSERT 
            TO authenticated 
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.blog_posts 
                    WHERE id = post_id AND (
                        author_id = auth.uid() OR 
                        EXISTS (
                            SELECT 1 FROM public.user_roles 
                            WHERE user_id = auth.uid() AND role = 'admin'
                        )
                    )
                )
            );
            
        -- Only post authors and admins can delete post-tag relationships
        CREATE POLICY "Authors and admins can delete post-tag relationships" 
            ON public.blog_posts_tags FOR DELETE 
            TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM public.blog_posts 
                    WHERE id = post_id AND (
                        author_id = auth.uid() OR 
                        EXISTS (
                            SELECT 1 FROM public.user_roles 
                            WHERE user_id = auth.uid() AND role = 'admin'
                        )
                    )
                )
            );
    END IF;

    -- Create some default categories if none exist
    IF NOT EXISTS (SELECT 1 FROM public.blog_categories LIMIT 1) THEN
        INSERT INTO public.blog_categories (name, slug) VALUES
            ('News', 'news'),
            ('Updates', 'updates'),
            ('Tutorials', 'tutorials'),
            ('Events', 'events');
    END IF;

    -- Create some default tags if none exist
    IF NOT EXISTS (SELECT 1 FROM public.blog_tags LIMIT 1) THEN
        INSERT INTO public.blog_tags (name, slug) VALUES
            ('Featured', 'featured'),
            ('Important', 'important'),
            ('Community', 'community'),
            ('Tips', 'tips');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create tables
SELECT create_blog_tables();

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to blog_posts table
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 