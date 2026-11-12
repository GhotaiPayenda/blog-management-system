# API Routes Documentation

Base URL: `http://localhost:5000/api`

Authentication: Admin-protected routes require header `Authorization: Bearer <JWT>`.

## Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check `{ status: "ok" }` |

## Auth (`/auth`)
| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/auth/login` | No | `{ email, password }` | Login account. Returns `{ token, admin, user }` including `role`, `status`. Rejects inactive accounts. |
| GET | `/auth/me` | Yes | - | Returns current authenticated account `{ admin, user }` (verified against DB; session invalidated if `token_version` changes). |

## Users (`/users`) — Admin only (role-based)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| GET | `/users` | Admin | `?page=&limit=&search=&role=` | List accounts with search (name/email) and role filter. Returns `{ users, pagination }`. |
| PATCH | `/users/:id/role` | Admin | `{ role: "Admin"|"User" }` | Change account role. Confirmation handled in UI. Prevents self-change and demoting/deleting last active admin. Bumps `token_version` to invalidate existing sessions. |
| DELETE | `/users/:id` | Admin | - | Delete account (with UI confirmation). Prevents self-delete and deleting last active admin; blocked if account has authored posts (FK safety). |

## Dashboard (`/dashboard`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | Admin | Returns `{ totalPosts, publishedPosts, draftPosts, totalCategories, recentPosts[] }` from DB. |

## Categories (`/categories`) — Admin
| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| GET | `/categories` | Admin | - | List all categories with `post_count`. |
| POST | `/categories` | Admin | `{ name }` | Create category (auto-slug, duplicate prevention). 409 if exists. |
| PUT | `/categories/:id` | Admin | `{ name }` | Update category name/slug. 404 if missing, 409 on duplicate. |
| DELETE | `/categories/:id` | Admin | - | Delete category. Associated posts become uncategorized (`category_id` set NULL). |

## Posts (`/posts`) — Admin
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| GET | `/posts` | Admin | `?page=&limit=&search=&category=&status=` | Paginated list with search by title, filter by category/status. Returns `{ posts, pagination }`. |
| GET | `/posts/:id` | Admin | - | Get single post by ID. |
| POST | `/posts` | Admin | `{ title, slug?, excerpt?, content, featured_image?, category_id?, status }` | Create post. Slug auto-generated from title if omitted; uniqueness enforced. Sets `published_at` when Published. |
| PUT | `/posts/:id` | Admin | Same as create | Update post. Slug uniqueness enforced (excluding self). Preserves `published_at` when re-publishing. |
| PATCH | `/posts/:id/publish` | Admin | - | Toggle Draft/Published. Sets/clears `published_at` appropriately. |
| DELETE | `/posts/:id` | Admin | - | Delete post (with confirmation on frontend). |

**Post fields:** `title` (required), `slug` (auto/unique), `excerpt`, `content` (required), `featured_image` (URL), `category_id`, `status` (`Draft`|`Published`), `published_at`, `created_at`, `updated_at`.

## Public (`/public`) — No Auth
| Method | Endpoint | Auth | Query / Params | Description |
|---|---|---|---|---|
| GET | `/public/posts` | No | `?page=&limit=&category=<slug>&search=` | Paginated **published** posts only, optionally filtered by category slug and/or searched by title/excerpt. |
| GET | `/public/posts/latest` | No | `?limit=` | Latest published posts (default 6, max 12) for homepage. |
| GET | `/public/posts/:slug` | No | - | Published post by slug with `related` posts (same category). 404 if not found/unpublished. |
| GET | `/public/categories` | No | - | List categories with post counts for public browsing/filtering. |

## Error Responses
- Validation errors: `400 { message: "Validation failed", errors: [{ field, message }] }`
- Unauthorized: `401 { message }`
- Not found: `404 { message }`
- Conflict (duplicates): `409 { message }`
- Server error: `500 { message }`

## Status Codes
`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.
