-- ==============================================
-- Yazidi Digital Library - Storage Setup
-- ==============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('book-covers', 'book-covers', true),
  ('book-files', 'book-files', false);

-- ==============================================
-- STORAGE POLICIES
-- ==============================================

-- Public can view book covers (anonymous browsing)
CREATE POLICY "Public can view book covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

-- Public can download book files (anonymous reading)
CREATE POLICY "Public can download books"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-files');

-- Only admins can upload/delete files
CREATE POLICY "Admins can manage book covers"
  ON storage.objects FOR INSERT
  USING (
    bucket_id = 'book-covers'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update book covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'book-covers'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete book covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-covers'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage book files"
  ON storage.objects FOR INSERT
  USING (
    bucket_id = 'book-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update book files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'book-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete book files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
