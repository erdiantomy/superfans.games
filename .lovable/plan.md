

## Assign Admin Role to Your Account

**What**: Insert a row into the `user_roles` table granting the `admin` role to your account (`erdian.tomy@gmail.com`, user ID `5da3f7d8-e292-46b3-9511-3d4ecbb41a00`).

**How**: Single SQL INSERT into `user_roles`:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('5da3f7d8-e292-46b3-9511-3d4ecbb41a00', 'admin');
```

**Result**: You'll be able to log in at `/superadmin` with your email and password, and the `has_role()` function will return `true` for your account, granting full access to the Super Admin dashboard including venue registration approvals, match management, and user oversight.

