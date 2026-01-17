import * as argon2 from 'argon2';

async function run() {
  const hash = await argon2.hash('123456');
  console.log(hash);
}

run();
