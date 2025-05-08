const bcrypt = require('bcryptjs');

// Replace this with your desired 6-digit code
const accessCode = '123456';

const hash = bcrypt.hashSync(accessCode, 10);
console.log('Your hashed access code is:');
console.log(hash);
console.log('\nAdd this to your .env.local file as:');
console.log(`NEXT_PUBLIC_ACCESS_CODE_HASH='${hash}'`); 