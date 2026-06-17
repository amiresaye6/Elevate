# Prisma CLI Command Reference Guide

This guide contains the most common Prisma commands you will need during development on the Academic Mentorship Platform.

> **Note**: Always run these commands from the `server` directory.

---

### 1. Seeding the Database (Populate Mock Data)
Run this command to clear existing data, reset auto-increment counters, and insert mock stacks, students, mentors, availabilities, review sessions, and audit logs.
```bash
npx prisma db seed
```

### 2. Opening Prisma Studio (Database GUI Viewer)
Starts a local web server with a visual editor for your database. You can view, add, edit, and delete records directly from your browser.
```bash
# By default, this opens http://localhost:5555
npx prisma studio
```

### 3. Generating the Prisma Client (Update TS Types)
Run this command whenever you modify the database models inside `prisma/schema.prisma`. It regenerates the type-safe client methods.
```bash
npx prisma generate
```

### 4. Creating and Applying Migrations (Schema Changes)
Run this command after updating `prisma/schema.prisma` to create a new SQL migration file and apply it to your database.
```bash
npx prisma migrate dev --name your_migration_name
```

### 5. Resetting the Database (Hard Reset)
Drops all database tables, re-runs all migrations from scratch, and automatically executes the seed file.
```bash
npx prisma migrate reset
```

### 6. Checking Migration Status
Checks if your local database is in sync with the schema migrations.
```bash
npx prisma migrate status
```
