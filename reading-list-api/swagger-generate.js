// swagger-generate.js (CommonJS)
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const { swaggerSpec } = require('./docs/swagger.js');

const out = path.resolve(__dirname, 'swagger.json');
writeFileSync(out, JSON.stringify(swaggerSpec, null, 2), 'utf8');
console.log('Generated', out);