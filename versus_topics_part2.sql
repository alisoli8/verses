-- Part 2: Celebrity, Sports, Movies & Lifestyle Battles
-- Continue from part 1 - run this after the first file

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM public.profiles WHERE email = 'admin@verses.app' LIMIT 1;

-- CELEBRITY & ENTERTAINMENT RIVALRIES (30 battles)
INSERT INTO public.posts (author_id, type, title, topic, option_a_name, option_a_image, option_b_name, option_b_image) VALUES
(admin_id, 'classic', 'Pop Princess Battle', 'Music', 'Taylor Swift', 'https://picsum.photos/seed/taylorswift/600/800', 'Katy Perry', 'https://picsum.photos/seed/katyperry/600/800'),
(admin_id, 'classic', 'Rap Royalty Clash', 'Hip Hop', 'Drake', 'https://picsum.photos/seed/drake/600/800', 'Kendrick Lamar', 'https://picsum.photos/seed/kendrick/600/800'),
(admin_id, 'classic', 'Hollywood Heartthrobs', 'Movies', 'Leonardo DiCaprio', 'https://picsum.photos/seed/dicaprio/600/800', 'Brad Pitt', 'https://picsum.photos/seed/bradpitt/600/800'),
(admin_id, 'classic', 'Action Movie Legends', 'Action Films', 'The Rock', 'https://picsum.photos/seed/therock/600/800', 'Vin Diesel', 'https://picsum.photos/seed/vindiesel/600/800'),
(admin_id, 'classic', 'Pop Icon Showdown', 'Pop Music', 'Britney Spears', 'https://picsum.photos/seed/britney/600/800', 'Christina Aguilera', 'https://picsum.photos/seed/christina/600/800'),
(admin_id, 'classic', 'Comedy Kings', 'Comedy', 'Will Ferrell', 'https://picsum.photos/seed/willferrell/600/800', 'Adam Sandler', 'https://picsum.photos/seed/adamsandler/600/800'),
(admin_id, 'classic', 'Late Night Legends', 'Talk Shows', 'Jimmy Fallon', 'https://picsum.photos/seed/fallon/600/800', 'Jimmy Kimmel', 'https://picsum.photos/seed/kimmel/600/800'),
(admin_id, 'classic', 'Marvel vs DC Icons', 'Superheroes', 'Robert Downey Jr.', 'https://picsum.photos/seed/rdj/600/800', 'Christian Bale', 'https://picsum.photos/seed/bale/600/800'),
(admin_id, 'classic', 'R&B Queens', 'R&B', 'Beyoncé', 'https://picsum.photos/seed/beyonce/600/800', 'Rihanna', 'https://picsum.photos/seed/rihanna/600/800'),
(admin_id, 'classic', 'Country Music Titans', 'Country', 'Carrie Underwood', 'https://picsum.photos/seed/carrieunderwood/600/800', 'Blake Shelton', 'https://picsum.photos/seed/blakeshelton/600/800'),
(admin_id, 'classic', 'Reality TV Queens', 'Reality TV', 'Kim Kardashian', 'https://picsum.photos/seed/kimk/600/800', 'Paris Hilton', 'https://picsum.photos/seed/parishilton/600/800'),
(admin_id, 'classic', 'Streaming Stars', 'Content Creation', 'MrBeast', 'https://picsum.photos/seed/mrbeast/600/800', 'PewDiePie', 'https://picsum.photos/seed/pewdiepie/600/800'),
(admin_id, 'classic', 'Fashion Icons', 'Fashion', 'Rihanna', 'https://picsum.photos/seed/rihannafashion/600/800', 'Lady Gaga', 'https://picsum.photos/seed/ladygaga/600/800'),
(admin_id, 'classic', 'Supermodel Showdown', 'Modeling', 'Gigi Hadid', 'https://picsum.photos/seed/gigihadid/600/800', 'Kendall Jenner', 'https://picsum.photos/seed/kendalljenner/600/800'),
(admin_id, 'classic', 'British Royalty', 'Royalty', 'Prince William', 'https://picsum.photos/seed/william/600/800', 'Prince Harry', 'https://picsum.photos/seed/harry/600/800'),
(admin_id, 'classic', 'Teen Pop Sensations', 'Teen Pop', 'Justin Bieber', 'https://picsum.photos/seed/bieber/600/800', 'Shawn Mendes', 'https://picsum.photos/seed/shawnmendes/600/800'),
(admin_id, 'classic', 'Actress Powerhouses', 'Drama', 'Meryl Streep', 'https://picsum.photos/seed/merylstreep/600/800', 'Cate Blanchett', 'https://picsum.photos/seed/cateblanchett/600/800'),
(admin_id, 'classic', 'Comedy Legends', 'Stand-up', 'Dave Chappelle', 'https://picsum.photos/seed/chappelle/600/800', 'Kevin Hart', 'https://picsum.photos/seed/kevinhart/600/800'),
(admin_id, 'classic', 'Rock Legends', 'Rock Music', 'The Beatles', 'https://picsum.photos/seed/beatles/600/800', 'The Rolling Stones', 'https://picsum.photos/seed/rollingstones/600/800'),
(admin_id, 'classic', 'Hip Hop Pioneers', 'Classic Hip Hop', 'Tupac', 'https://picsum.photos/seed/tupac/600/800', 'Biggie', 'https://picsum.photos/seed/biggie/600/800'),
(admin_id, 'classic', 'Pop Divas', 'Pop Classics', 'Madonna', 'https://picsum.photos/seed/madonna/600/800', 'Whitney Houston', 'https://picsum.photos/seed/whitney/600/800'),
(admin_id, 'classic', 'Action Heroes', 'Action Cinema', 'Arnold Schwarzenegger', 'https://picsum.photos/seed/arnold/600/800', 'Sylvester Stallone', 'https://picsum.photos/seed/stallone/600/800'),
(admin_id, 'classic', 'Sci-Fi Icons', 'Science Fiction', 'Harrison Ford', 'https://picsum.photos/seed/harrisonford/600/800', 'Mark Hamill', 'https://picsum.photos/seed/markhamill/600/800'),
(admin_id, 'classic', 'Horror Masters', 'Horror', 'Stephen King', 'https://picsum.photos/seed/stephenking/600/800', 'Alfred Hitchcock', 'https://picsum.photos/seed/hitchcock/600/800'),
(admin_id, 'classic', 'Animated Voice Legends', 'Animation', 'Tom Hanks', 'https://picsum.photos/seed/tomhanks/600/800', 'Robin Williams', 'https://picsum.photos/seed/robinwilliams/600/800'),
(admin_id, 'classic', 'Dance Pop Queens', 'Dance Music', 'Dua Lipa', 'https://picsum.photos/seed/dualipa/600/800', 'Ariana Grande', 'https://picsum.photos/seed/arianagrande/600/800'),
(admin_id, 'classic', 'Netflix Original Stars', 'Streaming', 'Millie Bobby Brown', 'https://picsum.photos/seed/milliebrown/600/800', 'Noah Schnapp', 'https://picsum.photos/seed/noahschnapp/600/800'),
(admin_id, 'classic', 'Marvel Chris Battle', 'Marvel', 'Chris Evans', 'https://picsum.photos/seed/chrisevans/600/800', 'Chris Hemsworth', 'https://picsum.photos/seed/chrishemsworth/600/800'),
(admin_id, 'classic', 'Disney Princess Voices', 'Disney', 'Idina Menzel', 'https://picsum.photos/seed/idinamenzel/600/800', 'Kristen Bell', 'https://picsum.photos/seed/kristenbell/600/800'),
(admin_id, 'classic', 'Rap Beef Legends', 'Rap Battles', 'Eminem', 'https://picsum.photos/seed/eminem/600/800', 'Jay-Z', 'https://picsum.photos/seed/jayz/600/800');

END $$;
