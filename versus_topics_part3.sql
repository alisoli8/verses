-- Part 3: Sports, Movies & Lifestyle Battles
-- Continue from part 2 - run this after the second file

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM public.profiles WHERE email = 'admin@verses.app' LIMIT 1;

-- SPORTS RIVALRIES (25 battles)
INSERT INTO public.posts (author_id, type, title, topic, option_a_name, option_a_image, option_b_name, option_b_image) VALUES
(admin_id, 'classic', 'GOAT Basketball Debate', 'Basketball', 'Michael Jordan', 'https://picsum.photos/seed/jordan/600/800', 'LeBron James', 'https://picsum.photos/seed/lebron/600/800'),
(admin_id, 'classic', 'Soccer Superstars', 'Soccer', 'Lionel Messi', 'https://picsum.photos/seed/messi/600/800', 'Cristiano Ronaldo', 'https://picsum.photos/seed/ronaldo/600/800'),
(admin_id, 'classic', 'Tennis Titans', 'Tennis', 'Roger Federer', 'https://picsum.photos/seed/federer/600/800', 'Rafael Nadal', 'https://picsum.photos/seed/nadal/600/800'),
(admin_id, 'classic', 'NFL Quarterbacks', 'Football', 'Tom Brady', 'https://picsum.photos/seed/brady/600/800', 'Peyton Manning', 'https://picsum.photos/seed/manning/600/800'),
(admin_id, 'classic', 'Boxing Legends', 'Boxing', 'Muhammad Ali', 'https://picsum.photos/seed/ali/600/800', 'Mike Tyson', 'https://picsum.photos/seed/tyson/600/800'),
(admin_id, 'classic', 'Basketball Legends', 'NBA History', 'Kobe Bryant', 'https://picsum.photos/seed/kobe/600/800', 'Tim Duncan', 'https://picsum.photos/seed/duncan/600/800'),
(admin_id, 'classic', 'Golf Greats', 'Golf', 'Tiger Woods', 'https://picsum.photos/seed/tiger/600/800', 'Phil Mickelson', 'https://picsum.photos/seed/phil/600/800'),
(admin_id, 'classic', 'Swimming Sensations', 'Swimming', 'Michael Phelps', 'https://picsum.photos/seed/phelps/600/800', 'Katie Ledecky', 'https://picsum.photos/seed/ledecky/600/800'),
(admin_id, 'classic', 'Track & Field Icons', 'Athletics', 'Usain Bolt', 'https://picsum.photos/seed/bolt/600/800', 'Carl Lewis', 'https://picsum.photos/seed/lewis/600/800'),
(admin_id, 'classic', 'Baseball Legends', 'Baseball', 'Babe Ruth', 'https://picsum.photos/seed/ruth/600/800', 'Hank Aaron', 'https://picsum.photos/seed/aaron/600/800'),
(admin_id, 'classic', 'Hockey Heroes', 'Hockey', 'Wayne Gretzky', 'https://picsum.photos/seed/gretzky/600/800', 'Mario Lemieux', 'https://picsum.photos/seed/lemieux/600/800'),
(admin_id, 'classic', 'Formula 1 Champions', 'Formula 1', 'Lewis Hamilton', 'https://picsum.photos/seed/hamilton/600/800', 'Max Verstappen', 'https://picsum.photos/seed/verstappen/600/800'),
(admin_id, 'classic', 'Women''s Tennis Queens', 'Women''s Tennis', 'Serena Williams', 'https://picsum.photos/seed/serena/600/800', 'Maria Sharapova', 'https://picsum.photos/seed/sharapova/600/800'),
(admin_id, 'classic', 'NBA Point Guards', 'Point Guards', 'Magic Johnson', 'https://picsum.photos/seed/magic/600/800', 'John Stockton', 'https://picsum.photos/seed/stockton/600/800'),
(admin_id, 'classic', 'Soccer Goalkeepers', 'Goalkeeping', 'Manuel Neuer', 'https://picsum.photos/seed/neuer/600/800', 'Gianluigi Buffon', 'https://picsum.photos/seed/buffon/600/800'),
(admin_id, 'classic', 'Olympic Gymnasts', 'Gymnastics', 'Simone Biles', 'https://picsum.photos/seed/biles/600/800', 'Nadia Comaneci', 'https://picsum.photos/seed/nadia/600/800'),
(admin_id, 'classic', 'UFC Legends', 'MMA', 'Conor McGregor', 'https://picsum.photos/seed/mcgregor/600/800', 'Khabib Nurmagomedov', 'https://picsum.photos/seed/khabib/600/800'),
(admin_id, 'classic', 'Cycling Champions', 'Cycling', 'Lance Armstrong', 'https://picsum.photos/seed/lance/600/800', 'Chris Froome', 'https://picsum.photos/seed/froome/600/800'),
(admin_id, 'classic', 'NBA Centers', 'Basketball Centers', 'Shaquille O''Neal', 'https://picsum.photos/seed/shaq/600/800', 'Hakeem Olajuwon', 'https://picsum.photos/seed/hakeem/600/800'),
(admin_id, 'classic', 'Soccer Strikers', 'Soccer Forwards', 'Pelé', 'https://picsum.photos/seed/pele/600/800', 'Diego Maradona', 'https://picsum.photos/seed/maradona/600/800'),
(admin_id, 'classic', 'NFL Running Backs', 'Running Backs', 'Jim Brown', 'https://picsum.photos/seed/jimbrown/600/800', 'Barry Sanders', 'https://picsum.photos/seed/sanders/600/800'),
(admin_id, 'classic', 'Wrestling Icons', 'Professional Wrestling', 'The Rock', 'https://picsum.photos/seed/rockwrestling/600/800', 'Stone Cold Steve Austin', 'https://picsum.photos/seed/stonecold/600/800'),
(admin_id, 'classic', 'Skateboarding Legends', 'Skateboarding', 'Tony Hawk', 'https://picsum.photos/seed/tonyhawk/600/800', 'Rodney Mullen', 'https://picsum.photos/seed/mullen/600/800'),
(admin_id, 'classic', 'Surfing Champions', 'Surfing', 'Kelly Slater', 'https://picsum.photos/seed/slater/600/800', 'John John Florence', 'https://picsum.photos/seed/florence/600/800'),
(admin_id, 'classic', 'Esports Legends', 'Gaming', 'Faker', 'https://picsum.photos/seed/faker/600/800', 'Ninja', 'https://picsum.photos/seed/ninja/600/800'),

-- MOVIE & TV RIVALRIES (25 battles)
(admin_id, 'classic', 'Sci-Fi Masterpieces', 'Science Fiction', 'Star Wars', 'https://picsum.photos/seed/starwars/600/800', 'Star Trek', 'https://picsum.photos/seed/startrek/600/800'),
(admin_id, 'classic', 'Superhero Universes', 'Superheroes', 'Marvel', 'https://picsum.photos/seed/marvel/600/800', 'DC Comics', 'https://picsum.photos/seed/dc/600/800'),
(admin_id, 'classic', 'Action Franchises', 'Action Movies', 'The Matrix', 'https://picsum.photos/seed/matrix/600/800', 'Terminator', 'https://picsum.photos/seed/terminator/600/800'),
(admin_id, 'classic', 'Horror Classics', 'Horror Movies', 'Halloween', 'https://picsum.photos/seed/halloween/600/800', 'Friday the 13th', 'https://picsum.photos/seed/friday13th/600/800'),
(admin_id, 'classic', 'Fantasy Epics', 'Fantasy', 'Lord of the Rings', 'https://picsum.photos/seed/lotr/600/800', 'Harry Potter', 'https://picsum.photos/seed/harrypotter/600/800'),
(admin_id, 'classic', 'Animated Studios', 'Animation', 'Disney', 'https://picsum.photos/seed/disneystudio/600/800', 'Pixar', 'https://picsum.photos/seed/pixar/600/800'),
(admin_id, 'classic', 'Crime Dramas', 'Crime', 'The Godfather', 'https://picsum.photos/seed/godfather/600/800', 'Goodfellas', 'https://picsum.photos/seed/goodfellas/600/800'),
(admin_id, 'classic', 'Romantic Comedies', 'Romance', 'When Harry Met Sally', 'https://picsum.photos/seed/harrysally/600/800', 'Pretty Woman', 'https://picsum.photos/seed/prettywoman/600/800'),
(admin_id, 'classic', 'Streaming Originals', 'TV Series', 'Stranger Things', 'https://picsum.photos/seed/strangerthings/600/800', 'The Boys', 'https://picsum.photos/seed/theboys/600/800'),
(admin_id, 'classic', 'Sitcom Legends', 'Comedy TV', 'Friends', 'https://picsum.photos/seed/friends/600/800', 'Seinfeld', 'https://picsum.photos/seed/seinfeld/600/800'),
(admin_id, 'classic', 'Drama Series', 'Drama TV', 'Breaking Bad', 'https://picsum.photos/seed/breakingbad/600/800', 'The Sopranos', 'https://picsum.photos/seed/sopranos/600/800'),
(admin_id, 'classic', 'Spy Franchises', 'Spy Movies', 'James Bond', 'https://picsum.photos/seed/bond/600/800', 'Mission Impossible', 'https://picsum.photos/seed/missionimpossible/600/800'),
(admin_id, 'classic', 'Zombie Shows', 'Horror TV', 'The Walking Dead', 'https://picsum.photos/seed/walkingdead/600/800', 'Fear the Walking Dead', 'https://picsum.photos/seed/fearwd/600/800'),
(admin_id, 'classic', 'Teen Dramas', 'Teen TV', 'Riverdale', 'https://picsum.photos/seed/riverdale/600/800', '13 Reasons Why', 'https://picsum.photos/seed/13reasons/600/800'),
(admin_id, 'classic', 'Medical Dramas', 'Medical TV', 'Grey''s Anatomy', 'https://picsum.photos/seed/greys/600/800', 'House', 'https://picsum.photos/seed/house/600/800'),
(admin_id, 'classic', 'Animated Series', 'Animated TV', 'The Simpsons', 'https://picsum.photos/seed/simpsons/600/800', 'Family Guy', 'https://picsum.photos/seed/familyguy/600/800'),
(admin_id, 'classic', 'Reality Competition', 'Reality TV', 'Survivor', 'https://picsum.photos/seed/survivor/600/800', 'Big Brother', 'https://picsum.photos/seed/bigbrother/600/800'),
(admin_id, 'classic', 'Cooking Shows', 'Food TV', 'MasterChef', 'https://picsum.photos/seed/masterchef/600/800', 'Hell''s Kitchen', 'https://picsum.photos/seed/hellskitchen/600/800'),
(admin_id, 'classic', 'Documentary Series', 'Documentaries', 'Planet Earth', 'https://picsum.photos/seed/planetearth/600/800', 'Our Planet', 'https://picsum.photos/seed/ourplanet/600/800'),
(admin_id, 'classic', 'Western Movies', 'Westerns', 'The Good, the Bad and the Ugly', 'https://picsum.photos/seed/goodbadugly/600/800', 'Unforgiven', 'https://picsum.photos/seed/unforgiven/600/800'),
(admin_id, 'classic', 'Thriller Movies', 'Thrillers', 'Psycho', 'https://picsum.photos/seed/psycho/600/800', 'The Silence of the Lambs', 'https://picsum.photos/seed/silencelambs/600/800'),
(admin_id, 'classic', 'War Movies', 'War Films', 'Saving Private Ryan', 'https://picsum.photos/seed/savingprivateryan/600/800', 'Apocalypse Now', 'https://picsum.photos/seed/apocalypsenow/600/800'),
(admin_id, 'classic', 'Comedy Movies', 'Comedy Films', 'Anchorman', 'https://picsum.photos/seed/anchorman/600/800', 'Dumb and Dumber', 'https://picsum.photos/seed/dumbdumber/600/800'),
(admin_id, 'classic', 'Disaster Movies', 'Disaster Films', 'Titanic', 'https://picsum.photos/seed/titanic/600/800', 'The Day After Tomorrow', 'https://picsum.photos/seed/dayaftertomorrow/600/800'),
(admin_id, 'classic', 'Heist Movies', 'Heist Films', 'Ocean''s Eleven', 'https://picsum.photos/seed/oceans11/600/800', 'The Italian Job', 'https://picsum.photos/seed/italianjob/600/800');

END $$;
