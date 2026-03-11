import { sequelize } from '../db.js';
import { Ente } from './Ente.js';
import { Persona } from './Persona.js';
import { PatenteCivile } from './PatenteCivile.js';
import { PatenteServizio } from './PatenteServizio.js';
import { Richiesta } from './Richiesta.js';
import { CategoriaPatente } from './CategoriaPatente.js';
import { StatoRichiesta } from './StatoRichiesta.js';
import { TipoRichiesta } from './TipoRichiesta.js';
import { StatoPatente } from './StatoPatente.js';
import { Allegato } from './Allegato.js';

Persona.hasMany(PatenteCivile, { foreignKey: 'id_persona' });
PatenteCivile.belongsTo(Persona, { foreignKey: 'id_persona' });

Persona.hasMany(PatenteServizio, { foreignKey: 'id_persona' });
PatenteServizio.belongsTo(Persona, { foreignKey: 'id_persona' });

Persona.hasMany(Richiesta, { foreignKey: 'id_persona' });
Richiesta.belongsTo(Persona, { foreignKey: 'id_persona' });

Ente.hasMany(Richiesta, { foreignKey: 'id_ente' });
Richiesta.belongsTo(Ente, { foreignKey: 'id_ente' });

Ente.hasMany(PatenteServizio, { foreignKey: 'id_ente' });
PatenteServizio.belongsTo(Ente, { foreignKey: 'id_ente' });

PatenteCivile.hasOne(PatenteServizio, { foreignKey: 'id_patentecivile' });
PatenteServizio.belongsTo(PatenteCivile, { foreignKey: 'id_patentecivile' });

PatenteCivile.belongsTo(CategoriaPatente, { foreignKey: 'id_categoria' });
PatenteCivile.belongsTo(StatoPatente, { foreignKey: 'id_stato' });

PatenteServizio.belongsTo(CategoriaPatente, { foreignKey: 'id_categoria' });
PatenteServizio.belongsTo(StatoPatente, { foreignKey: 'id_stato' });
PatenteServizio.belongsTo(Allegato, { as: 'Foto', foreignKey: 'id_foto' });
PatenteServizio.belongsTo(Allegato, { as: 'Firma', foreignKey: 'id_firma' });

Richiesta.belongsTo(TipoRichiesta, { foreignKey: 'id_tipo', as: 'Tipo' });
Richiesta.belongsTo(StatoRichiesta, { foreignKey: 'id_stato', as: 'Stato' });
Richiesta.belongsTo(Allegato, { as: 'Fototessera', foreignKey: 'id_foto' });
Richiesta.belongsTo(Allegato, { as: 'FirmaScansionata', foreignKey: 'id_firma' });

export {
    sequelize,
    Ente,
    Persona,
    PatenteCivile,
    PatenteServizio,
    Richiesta,
    CategoriaPatente,
    StatoRichiesta,
    TipoRichiesta,
    StatoPatente,
    Allegato,
};