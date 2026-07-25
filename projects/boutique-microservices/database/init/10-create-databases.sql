-- Create service-specific databases during Postgres initialization.
--
-- NOTE: these scripts run ONLY when the data volume is empty (first boot).
-- To re-run them: docker compose down -v && docker compose up -d
--
-- The previous version ended with `GRANT ALL PRIVILEGES ON DATABASE x TO postgres;`
-- which hardcoded the role name. Now that POSTGRES_USER comes from .env and is
-- no longer literally "postgres", that grant failed with
-- "role postgres does not exist" and aborted the whole init.
--
-- The grants are unnecessary anyway: CREATE DATABASE runs as POSTGRES_USER, so
-- that role is already the owner with full privileges.

CREATE DATABASE auth_db;
CREATE DATABASE products_db;
CREATE DATABASE orders_db;
CREATE DATABASE users_db;
