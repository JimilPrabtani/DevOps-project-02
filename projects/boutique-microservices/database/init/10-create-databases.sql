-- Create service-specific databases during Postgres initialization
CREATE DATABASE auth_db;
CREATE DATABASE products_db;
CREATE DATABASE orders_db;
CREATE DATABASE users_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE products_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE orders_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE users_db TO postgres;