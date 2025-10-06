-- Create users table for storing user profiles and goals
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    goal VARCHAR(50) NOT NULL,
    age INTEGER,
    weight DECIMAL(5,2),
    height INTEGER,
    activity_level VARCHAR(20),
    daily_calorie_limit INTEGER DEFAULT 2000,
    cuisines TEXT[],
    dislikes TEXT,
    allergies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create food_database table with popular products
CREATE TABLE IF NOT EXISTS food_database (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    serving_size VARCHAR(50) DEFAULT '100g',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meals table for user meal entries
CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    food_id INTEGER REFERENCES food_database(id),
    custom_name VARCHAR(200),
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    meal_time TIMESTAMP NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert popular Russian food products
INSERT INTO food_database (name, name_en, calories, protein, carbs, fat, category) VALUES
('Овсяная каша', 'Oatmeal', 68, 2.4, 12.0, 1.4, 'Завтрак'),
('Гречка отварная', 'Buckwheat', 110, 4.2, 21.3, 1.1, 'Гарнир'),
('Рис отварной', 'Rice', 116, 2.2, 25.0, 0.5, 'Гарнир'),
('Куриная грудка', 'Chicken breast', 165, 31.0, 0.0, 3.6, 'Белок'),
('Говядина', 'Beef', 250, 26.0, 0.0, 16.0, 'Белок'),
('Лосось', 'Salmon', 208, 20.0, 0.0, 13.0, 'Белок'),
('Яйцо куриное', 'Egg', 155, 12.7, 0.7, 11.5, 'Белок'),
('Творог 5%', 'Cottage cheese 5%', 121, 16.0, 1.8, 5.0, 'Молочное'),
('Молоко 2.5%', 'Milk 2.5%', 52, 2.8, 4.7, 2.5, 'Молочное'),
('Греческий йогурт', 'Greek yogurt', 59, 10.0, 3.6, 0.4, 'Молочное'),
('Банан', 'Banana', 89, 1.1, 23.0, 0.3, 'Фрукты'),
('Яблоко', 'Apple', 52, 0.3, 14.0, 0.2, 'Фрукты'),
('Апельсин', 'Orange', 43, 0.9, 8.1, 0.2, 'Фрукты'),
('Огурец', 'Cucumber', 15, 0.8, 3.6, 0.1, 'Овощи'),
('Помидор', 'Tomato', 18, 0.9, 3.9, 0.2, 'Овощи'),
('Брокколи', 'Broccoli', 34, 2.8, 7.0, 0.4, 'Овощи'),
('Картофель', 'Potato', 77, 2.0, 16.3, 0.4, 'Овощи'),
('Хлеб цельнозерновой', 'Whole grain bread', 247, 13.0, 45.0, 2.0, 'Хлеб'),
('Макароны', 'Pasta', 131, 5.0, 25.0, 1.1, 'Гарнир'),
('Миндаль', 'Almonds', 579, 21.0, 22.0, 49.0, 'Орехи'),
('Авокадо', 'Avocado', 160, 2.0, 8.5, 14.7, 'Овощи'),
('Оливковое масло', 'Olive oil', 884, 0.0, 0.0, 100.0, 'Масла');

CREATE INDEX IF NOT EXISTS idx_meals_user_time ON meals(user_id, meal_time);
CREATE INDEX IF NOT EXISTS idx_food_name ON food_database(name);
CREATE INDEX IF NOT EXISTS idx_food_category ON food_database(category);