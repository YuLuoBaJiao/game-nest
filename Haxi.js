const bcrypt = require('bcryptjs');

async function generate() {
  const password = '123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('新哈希值:', hash);
}

generate();