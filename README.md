<<<<<<< HEAD

# CRM Sales Management Backend

A REST API for managing leads, customers, sales deals, activities and audit timelines.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Zod validation
- Helmet, CORS and rate limiting

Run:

```bash
npm run dev
```

Production:

```bash
npm start
```

## Authentication

Register or login and copy the returned JWT token. Send it as:

`Authorization: Bearer <token>`

Passwords are hashed with bcrypt. Passwords are never returned by the API.

## Roles

- Admin: user management, all CRM data, assignment and reports.
- Sales Manager: team CRM access, lead assignment and reports.
- Sales Executive: assigned leads/customers/deals and activities.

## Main endpoints

### Auth

- POST `/api/auth/register`
  {
  "name": "Meghna sahoo",
  "email": "meghna@example.com",
  "password": "Password123",
  "role": "Admin"
  }

- POST `/api/auth/login`
  {
  "email": "meghna@example.com",
  "password": "Password123"
  }
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Users (Admin)

- GET `/api/users`
- GET `/api/users/:id`
- PATCH `/api/users/:id`
- DELETE `/api/users/:id`

### Leads

- POST `/api/leads`
- GET `/api/leads?page=1&limit=10&search=john&status=Qualified`
- GET `/api/leads/:id`
- PATCH `/api/leads/:id`
- PATCH `/api/leads/:id/status`
- PATCH `/api/leads/:id/assign`
- POST `/api/leads/:id/convert`
- DELETE `/api/leads/:id`

### Customers

- POST `/api/customers`
- GET `/api/customers`
- GET `/api/customers/:id`
- PATCH `/api/customers/:id`
- DELETE `/api/customers/:id`

### Deals

- POST `/api/deals`
- GET `/api/deals`
- GET `/api/deals/:id`
- PATCH `/api/deals/:id`
- DELETE `/api/deals/:id`

### Activities

- POST `/api/activities`
- GET `/api/activities`
- GET `/api/activities/:id`
- PATCH `/api/activities/:id`
- PATCH `/api/activities/:id/complete`
- DELETE `/api/activities/:id`

### Timeline

- GET `/api/timeline/:entityType/:entityId`

### Dashboard

- GET `/api/dashboard/summary`
- GET `/api/dashboard/pipeline`
- GET `/api/dashboard/team-performance`

## Database design

Collections:

- users
- leads
- customers
- deals
- activities
- timelines
