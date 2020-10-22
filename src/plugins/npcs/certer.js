const { certificates, certers } = require('@2003scape/rsc-data/certificates');

const CERTER_IDS = new Set(Object.keys(certers).map(Number));

// remove sidney smith since she's a special case
CERTER_IDS.delete(778);
