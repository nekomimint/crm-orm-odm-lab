const { Company } = require('../models/sequelize');

async function getAll(req, res) {
  // TODO CHALLENGE 03: construir el filtro de Sequelize a partir de req.query.industry
  const where = {};
  try {
    // Buscar el parametro industry en la query
    const { industry } = req.query;

    // Si existe, entonces lo agregamos al arreglo de condiciones
    if(industry) {
      where.industry = industry;
    }

  }catch(error) {
    return res.status(500).json({ error: error.message });
  }
  // Hacemos la consulta solamente incluyendo el where, en caso de que where sea nulo directamente retornara el arreglo vacio, en caso
  // de que no, retornara todas las incidencias
  const companies = await Company.findAll({ where: where, order: [['id', 'ASC']] });

  res.status(200).json(companies);
}

async function getById(req, res) {
  // TODO CHALLENGE 05: la respuesta debe incluir los contactos de la compañía

  // Solo habia que incluir en la consulta la clausula para el JOIN que es inlcude en el ORM
  const company = await Company.findByPk(req.params.id, {include: "contacts"});

  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }


  res.status(200).json(company);
}

async function create(req, res) {
  const { name, industry, salesPersonId } = req.body;
  const company = await Company.create({ name, industry, salesPersonId });

  res.status(201).json(company);
}

async function update(req, res) {
  const company = await Company.findByPk(req.params.id);

  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  await company.update(req.body, { fields: ['name', 'industry', 'salesPersonId'] });

  res.status(200).json(company);
}

async function remove(req, res) {
  const deleted = await Company.destroy({ where: { id: req.params.id } });

  if (deleted === 0) {
    return res.status(404).json({ error: 'Company not found' });
  }

  res.status(204).send();
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
