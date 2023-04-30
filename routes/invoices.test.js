

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async function () {
  // Clean up the database before each test
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query(`
  INSERT INTO companies (code, name, description) 
  VALUES ('apple', 'TestCompany', 'A company for testing')
  RETURNING code, name, description
`);

  let result = await db.query(`
      INSERT INTO invoices (comp_Code, amt, paid, paid_date)
      VALUES ('apple', 100, false, null)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`);
  testInvoice = result.rows[0];
});

describe("GET /invoices", function () {
  test("Gets a list of invoices", async function () {
    const response = await request(app).get(`/invoices`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      {
        invoices: [{
          id: testInvoice.id,
          comp_code: testInvoice.comp_code,
          amt: testInvoice.amt,
          paid: testInvoice.paid,
          add_date: "2023-04-30T07:00:00.000Z",
          paid_date: testInvoice.paid_date
        }]
      });
  });
});


describe("GET /invoices/:id", function () {
  test("Gets a single invoice", async function () {
    const response = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoice: {
        id: testInvoice.id,
        amt: testInvoice.amt,
        paid: testInvoice.paid,
        add_date: "2023-04-30T07:00:00.000Z",
        paid_date: testInvoice.paid_date,
        company: { code: "apple", name: "TestCompany", description: "A company for testing" }
      }
    });
  });




  test("Responds with 404 if can't find invoice", async function () {
    const response = await request(app).get(`/invoices/5`);
    expect(response.statusCode).toEqual(404);
  });
});


describe("POST /invoices", function () {
  test("Creates a new invoice", async function () {
    const response = await request(app)
      .post("/invoices")
      .send({ comp_Code: 'apple', amt: 400 });

    expect(response.body).toEqual({
      "invoice": {
        id: expect.any(Number),
        comp_code: "apple",
        amt: 400,
        add_date: expect.any(String),
        paid: false,
        paid_date: null,
      }
    });
  });
});



describe("DELETE /invoices/:id", function () {
  test("Deletes a single invoice", async function () {
    const response = await request(app)
      .delete(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ msg: "DELETED!" });
  });
});

afterEach(async function () {
  // Clean up the database after each test
  await db.query("DELETE FROM invoices");
});

afterAll(async function () {
  // close db connection
  await db.end();
});