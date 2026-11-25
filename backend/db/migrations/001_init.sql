CREATE TABLE IF NOT EXISTS users (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text        NOT NULL CHECK (length(btrim(name)) > 0),
  email         text        NOT NULL,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));

CREATE TABLE IF NOT EXISTS categories (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text    NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS authors (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name      text NOT NULL UNIQUE,
  bio       text,
  photo_url text
);

CREATE TABLE IF NOT EXISTS books (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       text    NOT NULL,
  author_id   integer NOT NULL REFERENCES authors(id)    ON DELETE RESTRICT,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  publisher   text    NOT NULL,
  format      text    NOT NULL CHECK (format IN ('Paperback', 'Hardcover')),
  description text    NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents > 0),
  cover_url   text    NOT NULL,
  sort_order  integer NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS books_category_idx ON books (category_id);
CREATE INDEX IF NOT EXISTS books_author_idx   ON books (author_id);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id    integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id    integer     NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  quantity   integer     NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  user_id    integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id    integer     NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id                      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                 integer       NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  confirmed_at            timestamptz   NOT NULL DEFAULT now(),
  cancelled_at            timestamptz,
  estimated_delivery_date date          NOT NULL,

  items_total_cents       integer       NOT NULL CHECK (items_total_cents >= 0),
  tax_rate                numeric(5,4)  NOT NULL,
  tax_cents               integer       NOT NULL CHECK (tax_cents >= 0),
  shipping_cents          integer       NOT NULL CHECK (shipping_cents >= 0),
  total_cents             integer       NOT NULL,

  payment_method          text          NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card')),
  payment_status          text          NOT NULL CHECK (payment_status IN ('paid', 'refunded')),

  shipping_first_name     text NOT NULL,
  shipping_last_name      text NOT NULL,
  shipping_phone          text NOT NULL,
  shipping_address        text NOT NULL,
  shipping_city           text NOT NULL,
  shipping_postal_code    text NOT NULL,
  shipping_state          text NOT NULL,
  shipping_country        text NOT NULL,

  CONSTRAINT orders_total_ck  CHECK (total_cents = items_total_cents + shipping_cents),
  CONSTRAINT orders_cancel_ck CHECK ((cancelled_at IS NULL) = (payment_status = 'paid'))
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, confirmed_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id         integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id          integer NOT NULL REFERENCES books(id)  ON DELETE RESTRICT,
  title            text    NOT NULL,
  author_name      text    NOT NULL,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents > 0),
  quantity         integer NOT NULL CHECK (quantity > 0),
  UNIQUE (order_id, book_id)
);
