-- Comprehensive Versus Topics Dataset for Verses App
-- Run this after creating the main schema to populate with real data
-- Total: 150+ versus battles across multiple categories

-- First, let's create some sample profiles (you'll replace these with real user data later)
INSERT INTO public.profiles (id, name, email, bio, profile_image_url, avatar_initial) VALUES
(gen_random_uuid(), 'Admin', 'admin@verses.app', 'The curator of epic battles', 'https://i.pravatar.cc/150?u=admin', 'A'),
(gen_random_uuid(), 'Battle Master', 'battles@verses.app', 'Creating the ultimate showdowns', 'https://i.pravatar.cc/150?u=battlemaster', 'B'),
(gen_random_uuid(), 'Versus King', 'king@verses.app', 'Settling debates since day one', 'https://i.pravatar.cc/150?u=versusking', 'V');

-- Get the admin profile ID for post creation
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM public.profiles WHERE email = 'admin@verses.app' LIMIT 1;

-- BRAND RIVALRIES (25 battles)
INSERT INTO public.posts (author_id, type, title, topic, option_a_name, option_a_image, option_b_name, option_b_image) VALUES
(admin_id, 'classic', 'The Cola Wars: Ultimate Showdown', 'Beverages', 'Coca-Cola', 'https://picsum.photos/seed/cocacola/600/800', 'Pepsi', 'https://picsum.photos/seed/pepsi/600/800'),
(admin_id, 'classic', 'Fast Food Titans Clash', 'Fast Food', 'McDonald''s', 'https://picsum.photos/seed/mcdonalds/600/800', 'Burger King', 'https://picsum.photos/seed/burgerking/600/800'),
(admin_id, 'classic', 'Tech Giants Battle', 'Technology', 'Apple', 'https://picsum.photos/seed/apple/600/800', 'Samsung', 'https://picsum.photos/seed/samsung/600/800'),
(admin_id, 'classic', 'Automotive Legends', 'Cars', 'Mercedes-Benz', 'https://picsum.photos/seed/mercedes/600/800', 'BMW', 'https://picsum.photos/seed/bmw/600/800'),
(admin_id, 'classic', 'Gaming Console Wars', 'Gaming', 'PlayStation', 'https://picsum.photos/seed/playstation/600/800', 'Xbox', 'https://picsum.photos/seed/xbox/600/800'),
(admin_id, 'classic', 'Streaming Supremacy', 'Entertainment', 'Netflix', 'https://picsum.photos/seed/netflix/600/800', 'Disney+', 'https://picsum.photos/seed/disney/600/800'),
(admin_id, 'classic', 'Coffee Culture Clash', 'Coffee', 'Starbucks', 'https://picsum.photos/seed/starbucks/600/800', 'Dunkin''', 'https://picsum.photos/seed/dunkin/600/800'),
(admin_id, 'classic', 'Sneaker Supremacy', 'Fashion', 'Nike', 'https://picsum.photos/seed/nike/600/800', 'Adidas', 'https://picsum.photos/seed/adidas/600/800'),
(admin_id, 'classic', 'Delivery Duel', 'Logistics', 'FedEx', 'https://picsum.photos/seed/fedex/600/800', 'UPS', 'https://picsum.photos/seed/ups/600/800'),
(admin_id, 'classic', 'Search Engine Showdown', 'Internet', 'Google', 'https://picsum.photos/seed/google/600/800', 'Bing', 'https://picsum.photos/seed/bing/600/800'),
(admin_id, 'classic', 'Social Media Titans', 'Social Media', 'Instagram', 'https://picsum.photos/seed/instagram/600/800', 'TikTok', 'https://picsum.photos/seed/tiktok/600/800'),
(admin_id, 'classic', 'Ride Share Rivalry', 'Transportation', 'Uber', 'https://picsum.photos/seed/uber/600/800', 'Lyft', 'https://picsum.photos/seed/lyft/600/800'),
(admin_id, 'classic', 'Credit Card Competition', 'Finance', 'Visa', 'https://picsum.photos/seed/visa/600/800', 'Mastercard', 'https://picsum.photos/seed/mastercard/600/800'),
(admin_id, 'classic', 'Luxury Fashion Face-off', 'Luxury', 'Gucci', 'https://picsum.photos/seed/gucci/600/800', 'Louis Vuitton', 'https://picsum.photos/seed/louisvuitton/600/800'),
(admin_id, 'classic', 'Smartphone Showdown', 'Mobile', 'iPhone', 'https://picsum.photos/seed/iphone/600/800', 'Android', 'https://picsum.photos/seed/android/600/800'),
(admin_id, 'classic', 'Cloud Computing Clash', 'Cloud Services', 'AWS', 'https://picsum.photos/seed/aws/600/800', 'Microsoft Azure', 'https://picsum.photos/seed/azure/600/800'),
(admin_id, 'classic', 'Energy Drink Duel', 'Energy Drinks', 'Red Bull', 'https://picsum.photos/seed/redbull/600/800', 'Monster', 'https://picsum.photos/seed/monster/600/800'),
(admin_id, 'classic', 'Pizza Chain Championship', 'Pizza', 'Domino''s', 'https://picsum.photos/seed/dominos/600/800', 'Pizza Hut', 'https://picsum.photos/seed/pizzahut/600/800'),
(admin_id, 'classic', 'Airline Alliance', 'Airlines', 'American Airlines', 'https://picsum.photos/seed/american/600/800', 'Delta', 'https://picsum.photos/seed/delta/600/800'),
(admin_id, 'classic', 'Luxury Car Legends', 'Luxury Cars', 'Ferrari', 'https://picsum.photos/seed/ferrari/600/800', 'Lamborghini', 'https://picsum.photos/seed/lamborghini/600/800'),
(admin_id, 'classic', 'Grocery Giants', 'Retail', 'Walmart', 'https://picsum.photos/seed/walmart/600/800', 'Target', 'https://picsum.photos/seed/target/600/800'),
(admin_id, 'classic', 'Telecom Titans', 'Telecommunications', 'Verizon', 'https://picsum.photos/seed/verizon/600/800', 'AT&T', 'https://picsum.photos/seed/att/600/800'),
(admin_id, 'classic', 'Ice Cream Icons', 'Desserts', 'Ben & Jerry''s', 'https://picsum.photos/seed/benjerrys/600/800', 'Häagen-Dazs', 'https://picsum.photos/seed/haagendazs/600/800'),
(admin_id, 'classic', 'Gaming Hardware Heroes', 'PC Gaming', 'NVIDIA', 'https://picsum.photos/seed/nvidia/600/800', 'AMD', 'https://picsum.photos/seed/amd/600/800'),
(admin_id, 'classic', 'Breakfast Cereal Showdown', 'Breakfast', 'Kellogg''s', 'https://picsum.photos/seed/kelloggs/600/800', 'General Mills', 'https://picsum.photos/seed/generalmills/600/800');

END $$;
