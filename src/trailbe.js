const express = require('express');
const { Sequelize, DataTypes } = require('sequelize'); // Import Sequelize and DataTypes
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sequelize connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: console.log, 
});

// Define the Tender model
const Tender = sequelize.define('Tender', {
  N_o: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  RefNum: { type: DataTypes.TEXT(255), allowNull: false },
  Description: { type: DataTypes.TEXT, allowNull: false },
  EndDate: { type: DataTypes.DATE(255), allowNull: false },
  StartDate: { type: DataTypes.DATE(255), allowNull: false },
  Region: { type: DataTypes.TEXT(255), allowNull: false },
  Amount: { type: DataTypes.INTEGER(255), allowNull: false },
  Remark: { type: DataTypes.TEXT(255), allowNull: false },
  Status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } // 0: not deleted, 1: deleted
}, {
  tableName: 'tenders', 
  timestamps: false,
});

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected with Sequelize!');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Sequelize connection failed:', err);
  });

// API route to get paginated tenders
app.get('/api/tenders', async (req, res) => {
  try {
    let { page = 1, pageSize = 5, search = "" } = req.query;
    page = parseInt(page, 10);
    pageSize = parseInt(pageSize, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(pageSize) || pageSize < 1) pageSize = 5;
    const offset = (page - 1) * pageSize;

    // Build where clause for filters and search
    const where = { Status: 0 }; // Only show not deleted
    // Add filters for each column if present
    ["RefNum", "Description", "Region", "Amount", "Remark", "StartDate", "EndDate"].forEach((key) => {
      if (req.query[key]) {
        // For string fields, use LIKE; for Amount, use exact match
        if (key === "Amount") {
          where[key] = req.query[key];
        } else if (key === "StartDate" || key === "EndDate") {
          where[key] = req.query[key];
        } else {
          where[key] = { [Sequelize.Op.like]: `%${req.query[key]}%` };
        }
      }
    });
    // Global search
    if (search) {
      where[Sequelize.Op.or] = [
        { RefNum: { [Sequelize.Op.like]: `%${search}%` } },
        { Description: { [Sequelize.Op.like]: `%${search}%` } },
        { Region: { [Sequelize.Op.like]: `%${search}%` } },
        { Remark: { [Sequelize.Op.like]: `%${search}%` } },
        Sequelize.where(Sequelize.cast(Sequelize.col('Amount'), 'CHAR'), { [Sequelize.Op.like]: `%${search}%` }),
      ];
    }

        // Sorting
        let order = [['N_o', 'ASC']]; // Default sort
        const { sortKey, sortDirection } = req.query;
        if (sortKey && Tender.rawAttributes[sortKey]) {
            // Only allow valid columns
            let dir = String(sortDirection).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            order = [[sortKey, dir]];
        }
        console.log(`[Tenders API] page: ${page}, pageSize: ${pageSize}, offset: ${offset}, where:`, where, 'order:', order);
        const { count, rows } = await Tender.findAndCountAll({
            where,
            offset,
            limit: pageSize,
            order
        });
        console.log(`[Tenders API] Returned ${rows.length} tenders out of ${count}`);
        res.json({
            tenders: rows,
            total: count,
            page,
            pageSize,
            totalPages: Math.ceil(count / pageSize)
        });
  } catch (err) {
    console.error('Error fetching tenders:', err);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.put('/api/tenders/:N_o', async (req, res) => {
  try {
    const { N_o } = req.params;
    const [updated] = await Tender.update(req.body, {
      where: { N_o }
    });
    if (updated) {
      const updatedTender = await Tender.findByPk(N_o);
      return res.json(updatedTender);
    }
    res.status(404).json({ error: 'Tender not found' });
  } catch (err) {
    console.error('Error updating tender:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.delete('/api/tenders/:N_o', async (req, res) => {
  try {
    const N_o = Number(req.params.N_o);
    if (!N_o || isNaN(N_o)) {
      return res.status(400).json({ error: 'Invalid tender ID' });
    }
    // Instead of deleting, set Status=1
    const [updated] = await Tender.update({ Status: 1 }, { where: { N_o } });
    if (updated) {
      return res.json({ message: 'Tender marked as deleted' });
    }
    res.status(404).json({ error: 'Tender not found' });
  } catch (err) {
    console.error('Error deleting tender:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});