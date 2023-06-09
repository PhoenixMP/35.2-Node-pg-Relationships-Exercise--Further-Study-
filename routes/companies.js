/** Routes for companies of biztime. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')

router.get('/', async (req, res, next) => {
    try {
        console.log('trying')
        const results = await db.query(`SELECT * FROM companies`)
        return res.json({ companies: results.rows })

    } catch (e) {
        return next(e);
    }

})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        let industries;
        let compResult = await db.query(
            `SELECT c.code, c.name, c.description, i.industry
             FROM companies as c
             LEFT JOIN ind_comp AS ic 
             ON c.code = ic.company_code
             LEFT JOIN industries as i
             ON ic.industry_code = i.code
             WHERE c.code = $1`,
            [code]
        );


        let invResult = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
            [code]
        );
        if (compResult.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }
        const { name, description } = compResult.rows[0];
        const invoices = invResult.rows.map(inv => inv.id);
        if (compResult.industries) {
            industries = compResult.rows.map(ind => ind.industry)
        } else {
            industries = [];
        }



        return res.json({ "company": { code, name, description, invoices, industries } });


    } catch (e) {
        return next(e)
    }
})





router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [slugify(name, { lower: true, strict: true }), name, description]);
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company with code of ${code}`, 404)
        }
        return res.send({ user: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})


router.delete('/:code', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        return res.send({ msg: "DELETED!" })
    } catch (e) {
        return next(e)
    }
})


module.exports = router;