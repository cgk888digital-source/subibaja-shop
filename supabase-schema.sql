-- Create products table for Subibaja app
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    sizes TEXT[] NOT NULL DEFAULT '{}',
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('Zapatos de Niña', 'Ropa', 'Primera Comunión')),
    gallery_urls TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    stock_status TEXT DEFAULT 'in_stock',
    is_available BOOLEAN NOT NULL DEFAULT true,
    prices_by_size JSONB DEFAULT '{}',
    badge TEXT
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Public profiles are viewable by everyone."
ON public.products FOR SELECT
USING ( true );

-- Admin can insert/update/delete (Needs to be refined based on actual auth logic, assuming authenticated users for now)
CREATE POLICY "Admins can insert products."
ON public.products FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can update products."
ON public.products FOR UPDATE
USING ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can delete products."
ON public.products FOR DELETE
USING ( auth.role() = 'authenticated' );

-- Create bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Product images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

CREATE POLICY "Anyone can upload product images."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );
