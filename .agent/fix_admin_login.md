---
description: How to Fix Admin Login (Invalid Login Credentials)
---

# Admin Login Fix

This error happens because the admin account does not exist in Supabase Authentication yet. Follow these steps:

1. **Register the Admin Account:**
   - Go to: `http://localhost:3000/register`
   - Use these exact details:
     - Name: `Admin`
     - Email: `admin@gmail.com`
     - Password: `password123` (or anything you prefer)
   - Click **Register**.

2. **Promote to Admin (Required Once):**
   - Go to **Supabase Dashboard** -> **SQL Editor**.
   - Copy and Run this SQL command:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE email = 'admin@gmail.com';
     UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb WHERE email = 'admin@gmail.com';
     ```

3. **Login:**
   - Go to `http://localhost:3000/login`
   - Login with `admin@gmail.com`.
   - You will see the **Admin Dashboard** link.
