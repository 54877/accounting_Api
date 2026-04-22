ALTER TABLE expenses
ADD COLUMN type ENUM('income', 'expense') NOT NULL DEFAULT 'expense';
--類型