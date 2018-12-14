/** Routes for users of pg-intro-demo. */
const express = require('express');

//Boilerplate to join to the database file
const db = require('../db');

//router is an instance of the Router Class.
const router = express.Router();

// APIError class
const APIError = require('../errors');

// Routing all home requests, returning all tables
router.get('/', async function(req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM companies`);

    return res.json(results.rows);
  } catch (err) {
    return next(err);
  }
});

/** Add Company **/

router.post('/', async function(req, res, next) {
  try {
    const { code, name, description } = req.body;

    const results = await db.query(
      `
      INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [code, name, description]
    );
    return res.json(results.rows);
  } catch (err) {
    return next(err);
  }
});

// ** EDIT existing company **

router.put('/:code', async function(req, res, next) {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      `
      UPDATE companies SET name=$2, description=$3
      WHERE code=$1 
      RETURNING code, name, description
      `,
      [req.params.code, name, description]
    );

    if (!result.rows.length) {
      throw new APIError('Company already exists in the database.', 404);
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

/**  Get company **/

// router.get('/:code', async function(req, res, next) {
//   try {
//     const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [
//       req.params.code
//     ]);

//     if (!result.rows.length) {
//       throw new APIError('Company not found in the database.', 404);
//     }

//     return res.json(result.rows[0]);
//   } catch (err) {
//     return next(err);
//   }
// });

/** Delete company **/

router.delete('/:code', async function(req, res, next) {
  try {
    const result = await db.query(
      `
      DELETE FROM companies 
      WHERE code = $1
      RETURNING *
    `,
      [req.params.code]
    );

    if (!result.rows.length) {
      throw new APIError('Company not found in the database.', 404);
    }

    return res.json({ message: 'Company deleted' });
  } catch (err) {
    return next(err);
  }
});

router.get('/:code', async function(req, res, next) {
  try {
    const result = await db.query(
      `
        SELECT * 
        FROM companies c 
        JOIN invoices i ON c.code = i.comp_code
        WHERE c.code = $1`,
      [req.params.code]
    );

    console.log(result.rows);

    let { code, name, description } = result.rows[0];
    let invoices = result.rows.map(r => {
      return {
        id: r.id,
        comp_code: r.comp_code,
        amt: r.amt,
        paid: r.paid,
        add_date: r.add_date,
        paid_date: r.paid_date
      };
    });

    return res.json({
      company: {
        code,
        name,
        description,
        invoice: invoices
      }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
