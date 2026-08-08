const fs = require('fs');
let content = fs.readFileSync('c:/Users/Elias/sigevir/backend/src/schemas/retencion.schemas.js', 'latin1');
content = content.replace(
  "titular_contacto: Joi.string().allow('', null).optional()\n}).min(1);",
  "titular_contacto: Joi.string().allow('', null).optional(),\n  unidad_judicial_destino_id: Joi.string().uuid().allow(null).optional()\n}).min(1);"
);
content = content.replace(
  "titular_contacto: Joi.string().allow('', null).optional()\r\n}).min(1);",
  "titular_contacto: Joi.string().allow('', null).optional(),\n  unidad_judicial_destino_id: Joi.string().uuid().allow(null).optional()\n}).min(1);"
);
fs.writeFileSync('c:/Users/Elias/sigevir/backend/src/schemas/retencion.schemas.js', content, 'utf8');
console.log('Updated');
