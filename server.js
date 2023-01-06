const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose

  // .connect(process.env.DATABASE_LOCAL, {  ======>> FOR LOCAL DATABASE CONNECTION
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connnection successfully');
  });

// console.log(process.env);
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
