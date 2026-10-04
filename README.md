# CRM ORM/ODM Lab

API REST de un CRM básico que combina un ORM (Sequelize + PostgreSQL) y un ODM (Mongoose + MongoDB).

## Stack

- Node.js 22, Express 5, CommonJS
- Sequelize + PostgreSQL 16 (`User`, `Company`, `Contact`)
- Mongoose + MongoDB 7 (`Activity`)
- Jest + Supertest
- GitHub Codespaces, Dev Containers, Docker Compose
- Supervisor (`npm run dev`)

## Arquitectura

```text
GitHub Codespace
│
├── app       Node.js 22  ──┬── Sequelize ──> postgres (PostgreSQL)
│                           └── Mongoose  ──> mongo    (MongoDB)
├── postgres
└── mongo
```

La aplicación se conecta por nombre de servicio (`postgres`, `mongo`). Las credenciales de desarrollo llegan como variables de entorno definidas en `.devcontainer/docker-compose.yml` (ver `.env.example`).

## Iniciar el Codespace

1. En GitHub: **Code → Codespaces → Create codespace on main**.
2. Espera a que se levanten los tres servicios (`app`, `postgres`, `mongo`). `postCreateCommand` ejecuta `npm install`.

## Instalar dependencias

```bash
npm install
```

## Seed y reset

```bash
npm run seed    # inserta datos deterministas (3 users, 4 companies, 8 contacts, 10 activities)
npm run reset   # elimina y recrea tablas/base de datos y vuelve a sembrar
```

## Iniciar la API

```bash
npm start       # node ./bin/www
npm run dev     # supervisor ./bin/www
```

Servidor en el puerto `3000` (variable `PORT`).

## Pruebas

```bash
npm test
```

Cada suite restablece PostgreSQL y MongoDB antes de ejecutarse y cierra las conexiones al terminar.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/users` | Listar usuarios |
| GET | `/users/:id` | Obtener usuario |
| POST | `/users` | Crear usuario |
| PUT | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |
| GET | `/companies` | Listar compañías (`?industry=`) |
| GET | `/companies/:id` | Obtener compañía |
| POST | `/companies` | Crear compañía |
| PUT | `/companies/:id` | Actualizar compañía |
| DELETE | `/companies/:id` | Eliminar compañía |
| GET | `/contacts` | Listar contactos |
| GET | `/contacts/:id` | Obtener contacto |
| POST | `/contacts` | Crear contacto |
| PUT | `/contacts/:id` | Actualizar contacto |
| DELETE | `/contacts/:id` | Eliminar contacto |
| GET | `/activities` | Listar actividades (`?type=`) |
| GET | `/activities/:id` | Obtener actividad |
| POST | `/activities` | Crear actividad |
| PUT | `/activities/:id` | Actualizar actividad |
| DELETE | `/activities/:id` | Eliminar actividad |

Los errores se devuelven como JSON: `{ "error": "Contact not found" }`.
# Preguntas
#### 1. Dos motores
- Razón por la que Activity es buen candidato para una base documental:
  
    R:No todas las actividades incluyen los mismos datos, dada la naturaleza de los registros, puden no haber contactos involucrados o usuarios, que el tipo de actividad sea diferente, por lo que un modelo flexible en donde no esta la misma información es muy importante.
  
- Razón por la que Company y Contact son buenos candidatos para una base relacional:
  
    R: A diferencia de Activity, aqui necesitamos rigidez en los datos, debido a que todos los usuarios deben ser iguales, todos los contactos deben contener la misma información, las bases relacionales sacan una ventaja al permitir la integridad extrema de los datos gracias a las restricciones disponibles, permitiendo tener una seguridad en la coherencia de datos.

#### 2. ORM vs ODM
- ¿Qué es un ORM y qué es un ODM?

   R: Un Mapeo objeto-relacional (Object Relational Mapping) es una tecnica de programacion enfocada en abstraer la logica de las bases de datos relacionales para representarla en algún lenguaje de programación orientado a objetos, del mismo modo el Mapeo objeto-documento (Object Document Mapping) hace la misma función de trasladar documentos y consultas a un lenguaje de programación.

- Librería de cada uno en este proyecto:
  - ORM: sequeelize
  - ODM: mongoose
- Diferencia importante entre ambos:
    
    R: Estan hechos para diferentes tipos de modelados, uno es esta hecho para algebra relacional y el otro orientado a documentos.

#### 3. Configuración por variables de entorno
- ¿Dónde se definen las credenciales en este Codespace y por qué es mala práctica escribirlas dentro de los archivos .js?
  
    R: En archivos .env o variables de entorno, el motivo es la seguridad, hardcodear las credencias (escribirlas en código) es una mala practica ya que incluyen información sensible como contraseñas, url privadas o datos de la arquitectura, por lo que un archivo dedicado a contener todos esos datos sensibles por separado es más oportuno ya que podemos asegurar que no se distribuyan manualmente.
    Además permiten flexibilidad, al desacoplar esos valores del funcionamiento del programa se puede permitir cambiar de entornos sin mucha complicación.


- Nombres de host que usa la app para conectarse (DB_HOST y MONGODB_URI) y por qué no son localhost:
  
    R: Localhost se refiere a si mismo (127.0.0.1), por lo que al querer acceder a servicios se va a apuntar hacia el propio contenedor, en lugar de permitir el DNS interno apuntar de manera correcta a los servicios como seria mongo en donde por si mismo va a conseguir resolver la IP correcta de cada contenedor.


#### 4. Asociaciones
Explica qué relación existe entre Company y Contact según models/sequelize/index.js.
- Relación: Uno a mucho (1:N)
- Llave foránea y tabla en la que vive: companyId, vive en Contact con el proposito de vincular un registro de un contacto a una empresa 
- Propósito del alias as: 'contacts': Se refiere al nombre de la propiedad dentro del objeto donde sequelize anida los datos al consultar con include y como se hace la relación en el código, basicamente permite que al momento de traer los datos conocer con que estructura debe entregarlos.

#### 5. Eager loading
En el Reto 05, ¿qué diferencia habría entre traer la compañía y luego hacer una segunda consulta para sus contactos, frente a traerlos en la misma consulta con include? ¿Cuál es preferible y por qué?

R: Es preferible usar include, ya que aprovecha el motor completo y reducimos la cantidad de consultas, en detalles tecnicos reduce la latencia de red ya que al hacer todo en una sola consulta en lugar de varias hay una respuesta más rápida, además el include funge como "JOIN" el cual esta optimizado a nivel SQL aprovechando al maximo los indices sin traer datos extras.

#### 6. Instancia vs Consulta
En la actualización (update) de contactos primero se busca el registro y luego se modifica. Compara ese enfoque con hacer un Model.update({...}, { where }) directo:
- Ventajas de cada enfoque:
  
R: Validación de datos, al buscar primero podemos verificar que el registro exista, tambien permite analizar los datos de cada campo para comprobar que existen cambios reales, pero ocupas dos consultas, mientras que Model.update aplica directamente los datos sin alguna comprobación intermediaria, es más limpio pero otorga menos control.

- ¿Qué devuelve cada uno?
  
R: La busqueda y luego la actualización regresan los registros actualizados, mientras que hacer directo Model.update regresa un arreglo con el numero de filas modificadas (no regresa objetos)

#### 7. Esquema flexible
- ¿Qué tipo de dato se usa para metadata en models/mongoose/activity.js y por qué permite guardar estructuras distintas para CALL, EMAIL y MEETING?
  
R: ```mongoose.Schema.Types.Mixed```, es lo que permite el polimorfismo ya que le indica a mongodb que desactive la validacion de estructura para esa propiedad, asi se pueden guardar atributos completamente diferentes sin necesidad de crear nuevas colecciones.


- ¿Qué desventaja tiene frente a definir cada campo con su tipo?
  
R: Se pierden las virtudes del ODM, mongodb deja de validar, para guardar datos tienes que especificar explicitamente que hubo una modificación ```activity.markModified('metadata')``` (esto lo tuve que investigar), tambien al no haber estructuras rigidas si no literalmente poder ser cualquier cosa quedas dependiente de abarcar cualquier caso posible (lo que pueden ser muchos ifs o switch muy extensos) y no termina de aprovechar la indexación y las busquedas rapidas.

#### 8. Sin ref
contactId y userId en Activity son números y no usan ref.
- ¿Por qué no se puede usar ref/populate aquí?
  
R: Son herramientas exclusivas de mongoose, por lo que si quisieramos hacer un ref en automatico buscaria el documento correspondiente cayendo en que no existe ya que las coleccciones contact y user no existen en la bdd de mongodb.

- ¿Qué consecuencia tiene para la integridad de los datos (por ejemplo, si se elimina un User en PostgreSQL)?
  
R: MongoDB no maneja llaves foraneas, por lo que quedan documentos huerfanos ya que al querer consultar la información en la otra base de datos no habra coherencia y habran documentos con usuario inexistentes.


#### 9. Documento actualizado
En el Reto 08:
- ¿Qué devolvía la actualización antes de tu corrección y por qué?
  
R: Devolvia el documento sin actualizar, porque por defecto el ODM retorna el documento sin actualizar.

- ¿Qué cambiaste para que devolviera el documento actualizado?
  
R: Se implementa la opción "new:true" o "returnDocument:"after" las cuales obligan al ODM a regresar el documento después de haber hecho la actualización. 


#### 10. Pruebas de comportamiento
Las pruebas no verifican que uses findAll() ni find(), sino la respuesta de la API. ¿Qué ventaja tiene probar el comportamiento en lugar de la implementación?

R: Que comprobamos los resultados no el procedimiento, asi independientemente de como se implemente una solución nos aseguramos de que el resultado sea el esperado asegurando que el sistema no se ropa si las capas necesitan comunicar datos entre ellos.

#### 11. Repetibilidad
¿Qué hace tests/setup.js antes y después de cada suite y por qué es necesario para que npm test dé el mismo resultado cada vez que se ejecuta?

R: Antes de cada suite borra los registros, para evitar que datos antiguos interfieran en las pruebas y despues genera los datos base para realizar las pruebas, asi aseguramos que no hayan confusiones por pruebas.

#### 12. Tu experiencia
- Reto más difícil y solución:
  
R:  Ninguno particularmente, todos fueron relativamente sencillos leyendo la documentacion de mongoose o sequelize, en lo particular el primer caso fue el más complejo ya que fue la puerta de entrada, de ahi en fuera todos se resumen en analizar el codigo actual, la necesidad y buscar si existe algo que ya realice esa funcion en particular. 
- Error o mensaje de fallo de Jest que te ayudó a encontrar el problema:
  
R: En el reto 06 si no funciono a la primera la implementación:
```  ● Challenge 06 - Mongoose: POST /activities con metadata flexible › crea una actividad CALL y persiste su metadata

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 500
```
# Evidencia
![Evidence image](https://i.imgur.com/NB7SJjB.png)

# Aclaración

Esta sección es para comentar que **no** hice función de los codespaces de GitHub, me parecen lentos, útiles ya que no necesitas de configuración externas, más sin embargo después de realizar el fork, levante tanto postgresql como mongodb en docker y con el repositorio clonado simplemente cambie las variables de entorno a ```localhost``` (precisamente hablando de una de las preguntas) ya que aqui si ocupaba que apunte el proyecto de NodeJS a los servicios, si hubiera ejecutado el lab en un contendor hubiera seguido el mismo procedimiento de colocar el nombre de los servicios para que docker resolviera por su cuenta la IP de cada contenedor.