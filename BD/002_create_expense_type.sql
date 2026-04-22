CREATE TYPE expense_type AS ENUM ('income', 'expense');
ALTER TABLE expenses
ADD COLUMN type expense_type NOT NULL DEFAULT 'expense';
SELECT *
FROM expenses;