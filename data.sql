DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime_test;

\c biztime_test;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

CREATE TABLE ind_comp (
    company_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
    industry_code TEXT NOT NULL REFERENCES industries ON DELETE CASCADE,
    PRIMARY KEY(company_code, industry_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('harg', 'Hargis Engineers inc', 'HVAC consulting');

INSERT INTO industries
  values ('tech', 'Technology'), ('ME', 'Mechanical Engineering');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

Insert Into ind_comp
VALUES('apple','tech'), ('ibm', 'tech'), ('harg', 'ME');
