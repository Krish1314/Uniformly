-- V11: Add size guide image URL to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS size_guide_image_url TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS size_guide_notes TEXT;

-- Seed default size guide notes per category
UPDATE categories SET size_guide_notes = 'Measure chest at the widest point. Add 2 inches for comfort fit.'
WHERE slug = 'shirts';

UPDATE categories SET size_guide_notes = 'Measure waist naturally. For bottoms, measure hip at widest point.'
WHERE slug = 'bottoms';

UPDATE categories SET size_guide_notes = 'Measure chest and shoulders. Outerwear is typically 1 size larger.'
WHERE slug = 'outerwear';

UPDATE categories SET size_guide_notes = 'One size fits most for ties and belts. Hats measured in cm.'
WHERE slug = 'accessories';
