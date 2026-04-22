CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    category TEXT,
    amount NUMERIC(10, 2),
    description TEXT
);
INSERT INTO expenses (category, amount, description)
VALUES ('餐飲', 150, '午餐便當');