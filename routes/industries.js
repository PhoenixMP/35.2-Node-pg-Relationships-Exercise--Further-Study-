/** Routes for industries of biztime. */

const express = require("express");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT i.code, i.industry, ic.company_code
             FROM industries AS i
             LEFT JOIN ind_comp AS ic
             on i.code = ic.industry_code
             ORDER BY i.code`);

        return res.json({ industries: results.rows })

    } catch (e) {
        return next(e);
    }

});

router.post('/', async (req, res, next) => {
    try {
        const { industry_code, company_code } = req.body;
        const results = await db.query('INSERT INTO ind_comp (industry_code, company_code) VALUES ($1, $2) RETURNING industry_code, company_code', [industry_code, company_code]);
        return res.status(201).json({ industry_company: results.rows[0] })

    } catch (e) {
        return next(e);
    }

});
module.exports = router;