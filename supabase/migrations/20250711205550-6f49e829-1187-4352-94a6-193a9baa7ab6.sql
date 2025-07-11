-- Update the existing user to have admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'provider1@example.com';