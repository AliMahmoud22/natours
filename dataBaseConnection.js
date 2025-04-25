import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

mongoose
  //   .connect(process.env.LOCAL_DATABASE)
  .connect(
    process.env.HOSTED_DATABASE.replace(
      '<db_password>',
      process.env.DB_PASSWORD,
    ),
  )
  .then(() => console.log('DataBase connected!!'));
