SELECT * FROM regions;

SELECT * FROM wines;

SELECT * FROM colors;

SELECT * FROM wine_descriptions;

SELECT * FROM foodtypes;
SELECT * FROM wine_foodtypes;

SELECT * FROM wine_types;

SELECT w.name
FROM wines AS w
WHERE w.wine_type_id = 5;

-- Selects all wines that pair well with the foodtype with id 1.
SELECT w.*
FROM wines AS w
JOIN wine_foodtypes AS wf
  ON w.wine_id = wf.wine_id
WHERE wf.foodtype_id = 1;

SELECT * FROM wine_properties;
SELECT * FROM properties;

-- Selects all wines with the property with id 1, if the property value for that wine is greater than or equal to 8
SELECT w.*
FROM wines AS w
JOIN wine_properties AS wp
    on w.wine_id = wp.wine_id
WHERE wp.property_id = 1 AND wp.value >= 8;

SELECT * FROM contents;
SELECT * FROM wine_contents;

SELECT * FROM grapes;
SELECT * FROM wine_grapes;

SELECT * FROM aromas;
SELECT * FROM wine_aromas;