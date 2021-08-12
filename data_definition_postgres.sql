-- First drop tables that depend on the other tables
DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS recipe_category;
DROP TABLE IF EXISTS ingredient_ethical_problem;
DROP TABLE IF EXISTS ingredient_alternative;


-- Then drop tables that are depended on
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS ethical_problem;
DROP TABLE IF EXISTS ethical_description;


CREATE TABLE ingredient (
    id SERIAL PRIMARY KEY NOT NULL,
    name text
);

CREATE TABLE account (
    id SERIAL PRIMARY KEY NOT NULL,
    first_name varchar(30),
    last_name varchar(30),
    email varchar(255),
    username varchar(30),
    "password" varchar(255)
);

INSERT INTO ingredient (name) VALUES
    ('All-Purpose Flour'),      --1
    ('Spaghetti Pasta'),        --2
    ('Egg Noodles'),            --3
    ('Flour Tortilla'),         --4
    ('Burger Buns'),            --5
    ('Sirloin Steak'),          --6
    ('Beef Patty'),             --7
    ('Pork'),                   --8
    ('Ham'),                    --9
    ('Bacon'),                  --10
    ('Russet Potato'),          --11
    ('Avocado'),                --12
    ('Mushroom'),               --13
    ('Tomato'),                 --14
    ('Lettuce'),                --15
    ('Garlic'),                 --16
    ('Parsley'),                --17
    ('Egg'),                    --18
    ('Butter'),                 --19
    ('Milk'),                   --20
    ('Cheddar Cheese'),         --21
    ('Parmesan Cheese'),        --22
    ('Sour Cream'),             --23
    ('Olive Oil'),              --24
    ('Barbeque Sauce'),         --25
    ('Salt'),                   --26
    ('Black Pepper'),           --27
    ('Sugar'),                  --28
    ('Heavy Cream'),            --29
    ('Cashew Cream'),           --30
    ('Soy Milk'),               --31
    ('Bananas'),                --32
    ('Chickpeas'),              --33
    ('Cashew Cheese'),          --34
    ('Chicken'),                --35
    ('Salmon'),                 --36
    ('Bluefin Tuna'),           --37
    ('Skipjack Tuna'),          --38
    ('Albacore'),               --39
    ('Lamb'),                   --40
    ('Baking Powder'),          --41
    ('Chives'),                 --42
    ('Red-Wine Vinaigrette'),   --43
    ('Roquefort Cheese');       --44


CREATE TABLE recipe (
    id SERIAL PRIMARY KEY NOT NULL,
    name text,
    owner_id int,
    public boolean not null,
    FOREIGN KEY (owner_id) REFERENCES account (id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO recipe (name, owner_id, public) VALUES
    ('Ham and Cheese Omelette', NULL, TRUE),  -- 1
    ('Breakfast Burrito', NULL, TRUE),        -- 2
    ('Cheeseburger', NULL, TRUE),             -- 3
    ('Pulled Pork Sandwich', NULL, TRUE),     -- 4
    ('Beef Stroganoff', NULL, TRUE),          -- 5
    ('Carbonara', NULL, TRUE),                -- 6
    ('Pancakes', NULL, TRUE),                 -- 7
    ('Cobb Salad', NULL, TRUE),               -- 8
    ('Mashed Potatoes', NULL, TRUE);         -- 9

CREATE TABLE category (
    id SERIAL PRIMARY KEY NOT NULL,
    name text
);

INSERT INTO category (name) VALUES
    ('Breakfast'),
    ('Lunch'),
    ('Dinner');

CREATE TABLE recipe_category (
    recipe_id INT,
    category_id INT,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category (id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO recipe_category (recipe_id, category_id) VALUES
    (1, 1),
    (2, 1),
    (3, 2),
    (4, 2),
    (5, 3),
    (6, 3),
    (7, 1),
    (8, 2),
    (9, 3);

CREATE TABLE recipe_ingredient (
    recipe_id INT,
    ingredient_id INT,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO recipe_ingredient (recipe_id, ingredient_id) VALUES
    -- Ham and Cheese Omelette
    (1, 9),
    (1, 17),
    (1, 18),
    (1, 19),
    (1, 20),
    (1, 21),
    (1, 26),
    (1, 27),
    -- Breakfast Burrito
    (2, 4),
    (2, 10),
    (2, 11),
    (2, 12),
    (2, 18),
    (2, 21),
    -- Cheeseburger
    (3, 5),
    (3, 7),
    (3, 14),
    (3, 15),
    (3, 21),
    -- Pulled Pork Sandwich
    (4, 5),
    (4, 8),
    (4, 25),
    (4, 26),
    (4, 28),
    -- Beef Stroganoff
    (5, 1),
    (5, 3),
    (5, 6),
    (5, 13),
    (5, 16),
    (5, 19),
    (5, 23),
    (5, 26),
    (5, 27),
    -- Carbonara
    (6, 2),
    (6, 10),
    (6, 16),
    (6, 17),
    (6, 18),
    (6, 22),
    (6, 24),
    (6, 26),
    (6, 27),
    -- Pancakes
    (7, 1),
    (7, 18),
    (7, 19),
    (7, 20),
    (7, 26),
    (7, 28),
    (7, 41),
    -- Cobb Salad
    (8, 15),
    (8, 14),
    (8, 10),
    (8, 35),
    (8, 18),
    (8, 12),
    (8, 42),
    (8, 43),
    (8, 44),
    -- Mashed Patatoes
    (9, 11),
    (9, 19),
    (9, 20),
    (9, 26),
    (9, 27);

create table ethical_problem (
    id SERIAL PRIMARY KEY NOT NULL,
    title text
);

insert into ethical_problem (title) values
    ('Deforestation'),
    ('Carbon Emission'),
    ('Overfishing');

create table ethical_description(
    id SERIAL PRIMARY KEY NOT NULL,
    explain text
);

insert into ethical_description (explain) values
    ('The decrease in forest areas across the world that are lost for other uses such as agricultural croplands, urbanization, or mining activities.'),
    ('The release of carbon into the atmosphere; the main contributors to climate change.'),
    ('The removal of a species of fish from a body of water at a rate that the species cannot replenish, resulting in those species becoming underpopulated in that area.');
 

create table ingredient_ethical_problem (
    ingredient_id INT,
    problem_id INT,
    explain_id INT,
    PRIMARY KEY (ingredient_id, problem_id, explain_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES ethical_problem (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (explain_id) REFERENCES ethical_description (id) ON UPDATE CASCADE ON DELETE CASCADE

);

insert into ingredient_ethical_problem values
    (12, 1, 1), -- Avocado and deforestation
    (6, 1, 1),  -- Sirloin Steak and deforestation
    (7, 1, 1),  -- Beef Patty and deforestation
    (18, 1, 1), -- Eggs and carbon emission
    (19, 2, 2), -- Butter and deforestation
    (20, 1, 2), -- Milk and deforestation
    (8, 1, 1),  -- Pork and carbon emission
    (9, 2, 2),  -- Ham and deforestation
    (10, 1, 1), -- Bacon and deforestation
    (21, 1, 1), -- Cheddar Cheese and deforestation
    (22, 1, 1), -- Parmesan Cheese and deforestation
    (3, 2, 1),  -- Egg Noodle and carbon emission
    (29, 2, 1), -- Heavy cream and carbon emission
    (37, 3, 3), -- Bluefin Tuna and overfishing
    (40, 2, 2), -- Lamb and carbon emission
    (44, 1, 1); -- Roquefort Cheese and deforestation

create table ingredient_alternative (
    ingredient_id INT,
    alternative_id INT,
    PRIMARY KEY (ingredient_id, alternative_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (alternative_id) REFERENCES ingredient (id) ON UPDATE CASCADE ON DELETE CASCADE
);

insert into ingredient_alternative (ingredient_id, alternative_id) values
    (29, 30), -- Heavy cream and cashew cream
    (29, 31), -- Heavy cream and soy milk
    (12,33),  -- Avacado and Chickpeas
    (12,32),  -- Avacado and Bananas
    (18,33),  -- Egg and Chickpeas
    (6,35),    -- Sirloin Steak and Chicken
    (6,36),    -- Sirloin Steak and Salmon
    (6,13),   -- Sirloin Steak and Mushroom
    (6,15),   -- Sirloin Steak and Lettuce
    (7,35),    -- Beef Patty and Chicken
    (7,36),    -- Beef Patty and Salmon
    (7,13),   -- Beef Patty and Mushroom
    (7,15),   -- Beef Patty and Lettuce
    (19, 31), -- Butter and Soy Milk
    (19,24),  -- Butter and Olive Oil
    (20, 31), -- Milk and Soy Milk
    (21, 34), -- Cheddar Cheese and Cashew Cheese
    (22, 34), -- Parmesan Cheese and Cashew Cheese
    (8, 35),  -- Pork and Chicken
    (8, 36),  -- Pork and Salmon
    (9, 35),  -- Ham and Chicken
    (9, 36),  -- Ham and Salmon
    (10, 35), -- Bacon and Chicken
    (10, 36), -- Bacon and Salmon
	(3, 11),  -- Egg Noodle and Russet Potatoes
    (37, 38), -- Bluefin Tuna and Skipjack Tuna
    (37, 39), -- Bluefin Tuna and Albacore
    (40, 35), -- Lamb and Chicken
    (44, 34); -- Roquefort Cheese and Cashew Cheese

