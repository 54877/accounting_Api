CREATE TABLE IF NOT EXISTS users_table(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
ALTER TABLE expenses
ADD COLUMN user_id UUID REFERENCES users_table(id);