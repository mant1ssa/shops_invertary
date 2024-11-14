import { Sequelize, DataTypes } from 'sequelize';
import connection from './config';

const { database, user, password, host } = connection;

const sequelize = new Sequelize(database, user, password, {
  host,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
});

// Проверяем подключение
sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

export default sequelize;
