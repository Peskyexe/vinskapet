DROP TABLE IF EXISTS producers CASCADE;
CREATE TABLE "producers" (
  "producer_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(100) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS regions CASCADE;
CREATE TABLE "regions" (
  "region_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "parent_id" integer,
  CONSTRAINT regions_unique_name_parent UNIQUE ("name", "parent_id"),
  CONSTRAINT regions_parent_fk FOREIGN KEY ("parent_id") REFERENCES "regions" ("region_id")
);

DROP TABLE IF EXISTS colors CASCADE;
CREATE TABLE "colors" (
  "color_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(50) UNIQUE NOT NULL,
  "hex_code" char(6)
);

DROP TABLE IF EXISTS purchase_categories CASCADE;
CREATE TABLE "purchase_categories" (
  "purchase_category_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(50) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS wine_types CASCADE;
CREATE TABLE "wine_types" (
  "wine_type_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(125) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS wines CASCADE;
CREATE TABLE "wines" (
  "wine_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "vmp_id" integer UNIQUE NOT NULL,
  "name" varchar(125) NOT NULL,
  "vintage_year" integer NOT NULL,
  "wine_type_id" integer NOT NULL,
  "producer_id" integer NOT NULL,
  "region_id" integer NOT NULL,
  "color_id" integer NOT NULL,
  "volume_cl" integer CHECK (volume_cl > 0),
  "price_kr" decimal(10,2) CHECK (price_kr >= 0),
  "purchase_category_id" integer NOT NULL,
  "image_path" varchar(255),
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT wines_producer_fk FOREIGN KEY ("producer_id") REFERENCES "producers" ("producer_id"),
  CONSTRAINT wines_region_fk FOREIGN KEY ("region_id") REFERENCES "regions" ("region_id"),
  CONSTRAINT wines_color_fk FOREIGN KEY ("color_id") REFERENCES "colors" ("color_id"),
  CONSTRAINT wines_purchase_category_fk FOREIGN KEY ("purchase_category_id") REFERENCES "purchase_categories" ("purchase_category_id")
);

DROP TABLE IF EXISTS foodtypes CASCADE;
CREATE TABLE "foodtypes" (
  "foodtype_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(20) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS properties CASCADE;
CREATE TABLE "properties" (
  "property_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(50) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS grapes CASCADE;
CREATE TABLE "grapes" (
  "grape_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(50) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS contents CASCADE;
CREATE TABLE "contents" (
  "content_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(50) NOT NULL,
  "unit" varchar(10) NOT NULL,
  CONSTRAINT contents_unique_name_unit UNIQUE ("name", "unit")
);

DROP TABLE IF EXISTS wine_descriptions CASCADE;
CREATE TABLE "wine_descriptions" (
  "wine_id" integer PRIMARY KEY,
  "aroma_text" text,
  "taste_text" text,
  CONSTRAINT wine_descriptions_wine_fk FOREIGN KEY ("wine_id") REFERENCES "wines" ("wine_id") ON DELETE CASCADE
);

DROP TABLE IF EXISTS aromas CASCADE;
CREATE TABLE "aromas" (
  "aroma_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(50) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS wine_aromas CASCADE;
CREATE TABLE "wine_aromas" (
  "wine_id" integer NOT NULL,
  "aroma_id" integer NOT NULL,
  PRIMARY KEY ("wine_id", "aroma_id"),
  CONSTRAINT wine_aromas_wine_fk FOREIGN KEY ("wine_id") REFERENCES "wines" ("wine_id") ON DELETE CASCADE,
  CONSTRAINT wine_aromas_aroma_fk FOREIGN KEY ("aroma_id") REFERENCES "aromas" ("aroma_id")
);

DROP TABLE IF EXISTS tastes CASCADE;
CREATE TABLE "tastes" (
  "taste_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" varchar(50) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS wine_tastes CASCADE;
CREATE TABLE "wine_tastes" (
  "wine_id" integer NOT NULL,
  "taste_id" integer NOT NULL,
  PRIMARY KEY ("wine_id", "taste_id"),
  CONSTRAINT wine_tastes_wine_fk FOREIGN KEY ("wine_id") REFERENCES "wines" ("wine_id") ON DELETE CASCADE,
  CONSTRAINT wine_tastes_taste_fk FOREIGN KEY ("taste_id") REFERENCES "tastes" ("taste_id")
);

DROP TABLE IF EXISTS wine_foodtypes CASCADE;
CREATE TABLE "wine_foodtypes" (
  "foodtype_id" integer NOT NULL,
  "wine_id" integer NOT NULL,
  PRIMARY KEY ("wine_id", "foodtype_id"),
  CONSTRAINT wine_foodtypes_wine_fk FOREIGN KEY ("wine_id") REFERENCES "wines" ("wine_id") ON DELETE CASCADE,
  CONSTRAINT wine_foodtypes_foodtype_fk FOREIGN KEY ("foodtype_id") REFERENCES "foodtypes" ("foodtype_id")
);

DROP TABLE IF EXISTS wine_properties CASCADE;
CREATE TABLE "wine_properties" (
  "property_id" integer NOT NULL,
  "wine_id" integer NOT NULL,
  "value" integer NOT NULL CHECK (value >= 1 AND value <= 12),
  PRIMARY KEY ("wine_id", "property_id"),
  CONSTRAINT wine_properties_wine_fk FOREIGN KEY ("wine_id") REFERENCES "wines" ("wine_id") ON DELETE CASCADE,
  CONSTRAINT wine_properties_property_fk FOREIGN KEY ("property_id") REFERENCES "properties" ("property_id")
);

DROP TABLE IF EXISTS wine_grapes CASCADE;
CREATE TABLE "wine_grapes" (
  "grape_id" integer NOT NULL,
  "wine_id" integer NOT NULL,
  "percentage" integer NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  PRIMARY KEY ("wine_id", "grape_id"),
  CONSTRAINT wine_grapes_wine_fk FOREIGN KEY ("wine_id") REFERENCES "wines" ("wine_id") ON DELETE CASCADE,
  CONSTRAINT wine_grapes_grape_fk FOREIGN KEY ("grape_id") REFERENCES "grapes" ("grape_id")
);

DROP TABLE IF EXISTS wine_contents CASCADE;
CREATE TABLE "wine_contents" (
  "content_id" integer NOT NULL,
  "wine_id" integer NOT NULL,
  "amount" decimal(10,2) NOT NULL,
  "less_than" boolean,
  PRIMARY KEY ("wine_id", "content_id"),
  CONSTRAINT wine_contents_wine_fk FOREIGN KEY ("wine_id") REFERENCES "wines" ("wine_id") ON DELETE CASCADE,
  CONSTRAINT wine_contents_content_fk FOREIGN KEY ("content_id") REFERENCES "contents" ("content_id")
);

CREATE OR REPLACE FUNCTION update_wines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wines_updated_at
BEFORE UPDATE ON "wines"
FOR EACH ROW
EXECUTE FUNCTION update_wines_updated_at();

CREATE INDEX ON "wines" ("vmp_id");
CREATE INDEX ON "wines" ("producer_id");
CREATE INDEX ON "wines" ("region_id");
CREATE INDEX ON "wines" ("color_id");
CREATE INDEX ON "wines" ("vintage_year");
CREATE INDEX ON "wines" ("price_kr");
CREATE INDEX ON "wine_foodtypes" ("foodtype_id");
CREATE INDEX ON "wine_properties" ("property_id");
CREATE INDEX ON "wine_grapes" ("grape_id");
CREATE INDEX ON "wine_aromas" ("aroma_id");
CREATE INDEX ON "wine_tastes" ("taste_id");
