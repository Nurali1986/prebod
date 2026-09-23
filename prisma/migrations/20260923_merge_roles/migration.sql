-- Merge rep and candidate roles into sales
UPDATE "User" SET role = 'sales' WHERE role IN ('rep', 'candidate');
