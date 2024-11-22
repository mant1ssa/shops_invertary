
import pgPromise from 'pg-promise';

const pgp = pgPromise({
    receive(data, result, e) {
        camelizeColumns(data);
    }
});

const db = pgp({
    host: 'history_db',
    port: 5432,
    database: 'history',
    user: 'history',
    password: 'history'
});

function camelizeColumns(data) {
    const tmp = data[0];
    for (const prop in tmp) {
        const camel = pgp.utils.camelizeVar(prop);
        if (!(camel in tmp)) {
            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                d[camel] = d[prop];
                delete d[prop];
            }
        }
    }
}

async function checkConnection() {
    try {
      const result = await db.one('SELECT id AS result FROM history WHERE id = 1');
      console.log('Подключение к базе данных прошло успешно. Результат:', result.result);
    } catch (err) {
      console.error('Ошибка подключения к базе данных:', err);
    } 
    finally {
      // Закрыть соединение с базой данных после проверки
      // pgp.end();
    }
  }
  
checkConnection();

export { db };