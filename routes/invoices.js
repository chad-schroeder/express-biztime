/** Routes for users of pg-intro-demo. */
const express = require('express');

//Boilerplate to join to the database file
const db = require('../db');

//router is an instance of the Router Class.
const router = express.Router();

// APIError class
const APIError = require('../errors');

router.get('/', async function(req, res, next) {
  try {
    const result = await db.query(`SELECT * FROM invoices`);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const result = await db.query(
      `
        SELECT * 
        FROM invoices i
        JOIN companies c ON c.code = i.comp_code
        WHERE i.id = $1`,
      [req.params.id]
    );

    let {
      id,
      amt,
      paid,
      add_date,
      paid_date,
      code,
      name,
      description
    } = result.rows[0];

    return res.json({
      invoice: {
        id,
        amt,
        paid,
        add_date,
        paid_date,
        company: {
          code,
          name,
          description
        }
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function(req, res, next) {
  try {
    const { comp_code, amt } = req.body;

    const results = await db.query(
      `
        INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING *
        `,
      [comp_code, amt]
    );

    return res.json(results.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', async function(req, res, next) {
  try {
    const { amt } = req.body;

    const result = await db.query(
      `
      UPDATE invoices SET amt=$2
      WHERE id=$1
      RETURNING *
      `,
      [req.params.id, amt]
    );

    if (!result.rows.length) {
      throw new APIError('Invoice not found.', 404);
    }

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Delete company **/

router.delete('/:id', async function(req, res, next) {
  try {
    const result = await db.query(
      `
      DELETE FROM invoices
      WHERE id = $1
      RETURNING *
    `,
      [req.params.id]
    );

    if (!result.rows.length) {
      throw new APIError('Invoice not found in the database.', 404);
    }

    return res.json({ message: 'Invoice deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
