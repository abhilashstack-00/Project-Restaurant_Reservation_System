/**
 * Run with: npm run seed
 * Populates the database with the restaurant's initial floor plan.
 * Safe to re-run: it skips tables that already exist by tableNumber.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Table = require('../models/Table');

const tableSeedData = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 4 },
  { tableNumber: 6, capacity: 6 },
  { tableNumber: 7, capacity: 6 },
  { tableNumber: 8, capacity: 8 },
  { tableNumber: 9, capacity: 8 },
  { tableNumber: 10, capacity: 10 },
];

const seedTables = async () => {
  let created = 0;
  for (const tableData of tableSeedData) {
    const exists = await Table.findOne({ tableNumber: tableData.tableNumber });
    if (!exists) {
      await Table.create(tableData);
      created += 1;
    }
  }

  console.log(`Seed complete. ${created} new table(s) created, ${tableSeedData.length - created} already existed.`);
};

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedTables();
    await mongoose.disconnect();
    process.exit(0);
  })().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedTables;
