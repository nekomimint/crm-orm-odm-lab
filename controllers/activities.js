const Activity = require('../models/mongoose/activity');

async function getAll(req, res) {
  // TODO CHALLENGE 04: construir el filtro de Mongoose a partir de req.query.type
  const filter = {};
  try {
    const{ type } = req.query;

    if(type) {
      filter.type = type
    }

  }catch (error) {

  }
  // TODO CHALLENGE 02: recuperar las actividades con Mongoose
  // 02: Pues mongoose como es mongoDB y find() busca absolutamente todos los documentos no hay mucha complejidad
  // 04: Pues resulta que la misma documentacion te especifica que puedes pasar un arreglo {} los cuales fungiran como filtros, siendo el
  // primer parametro
  const activities = await Activity.find(filter);

  res.status(200).json(activities);
}

async function getById(req, res) {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  res.status(200).json(activity);
}

async function create(req, res) {
  // TODO CHALLENGE 06: persistir correctamente el campo metadata (estructura variable segun type)
  const { type, description, contactId, userId, metadata } = req.body;
  const activity = await Activity.create({ type, description, contactId, userId, metadata });

  res.status(201).json(activity);
}





async function update(req, res) {
  // TODO CHALLENGE 08: revisar la operación de actualización
  // Segun la doc, las opciones incluyen por default en returnDocuemnt:'before', lo cual se arregla colocando el valor 'after',
  // Tambien se puede sustituir por new:true
  // Y parte importante segun entendi, runValidator hace que internamente ejecute validaciones especificadas en los schemas
  const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {returnDocument:'after', runValidators: true});

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  res.status(200).json(activity);
}

async function remove(req, res) {
  const activity = await Activity.findByIdAndDelete(req.params.id);

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
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
