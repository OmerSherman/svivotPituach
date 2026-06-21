# backend/migrations/

Reference SQL migration history, reconstructed to match `backend/models/schema.prisma` stage by
stage. **Not executed by anything** — kept to satisfy the assignment's required `migrations/`
folder layout. The live database is created/updated exclusively via Prisma:

```
npm run db:setup   # prisma db push --force-reset --schema=models/schema.prisma, then reseeds
npm run db:seed    # prisma db push (no reset) + seeds only if empty
```

`prisma db push` diffs `schema.prisma` directly against MySQL — it never reads these `.sql` files.

## Chain

| File | Adds |
|---|---|
| `001_init.sql` | Baseline tables: `user`, `country`, `city`, `attraction`, `trip`, `trip_attraction`, `settings`, `message` |
| `002_city_media.sql` | `city.summary_he` / `city.banner_image_url` + seed data |
| `003_country_media.sql` | `country.summary_he` / `country.banner_image_url` + seed data |
| `004_geo_coordinates.sql` | `country.latitude/longitude`, `city.latitude/longitude` (map pins) |

Run in order against an empty database, this chain reaches full structural parity with the current
`schema.prisma` — every table, column, type, and foreign key matches (including `trip.countryId`'s
FK to `country`, and the explicit `@db.*` overrides like `attraction.img_url VARCHAR(2048)` and
`trip.createdAt DATE`).
