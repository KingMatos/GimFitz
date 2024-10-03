const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require("jsonwebtoken");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.post("/add-user", async (req, res) => {
  const { dni, nombres, apellidos, email, initial_date } = req.body;

  try {
    const client = await pool.connect();

    // Formatear la fecha en el formato deseado (mm/dd/yyyy)
    const formattedInitialDate = new Date(initial_date);
    formattedInitialDate.setUTCDate(formattedInitialDate.getUTCDate() + 1); // Sumar un día
    const formattedDateStr = formattedInitialDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    // Calcular el finalDate sumando un mes a la fecha inicial
    const finalDateObject = new Date(formattedInitialDate);
    finalDateObject.setUTCMonth(finalDateObject.getUTCMonth() + 1);
    const formattedFinalDate = finalDateObject.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    // Contraseña por defecto
    const password = dni;

    // Insertar el nuevo usuario en la tabla usuarios
    const query = `
      INSERT INTO usuarios (dni, nombres, apellidos, email, initial_date, final_date, password, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`;
    const values = [dni, nombres, apellidos, email, formattedDateStr, formattedFinalDate, password, 'user'];
    const result = await client.query(query, values);

    ///
    // Obtén el mes de la fecha de inicio del nuevo usuario
    const initialDateMonth = formattedInitialDate.toLocaleDateString('en-US', { month: 'short' });

    const monthQuery = `
    UPDATE earnings
    SET monthly_earnings = monthly_earnings + $1
    WHERE month = $2
    RETURNING *`;
    const monthValues = [5000, initialDateMonth];
    const monthResult = await client.query(monthQuery, monthValues);
    
    if (monthResult.rows.length === 0) {
      // Si no hay registros para ese mes, se crea uno nuevo
      const newMonthQuery = `
        INSERT INTO earnings (month, monthly_earnings)
        VALUES ($1, $2)
        RETURNING *`;
      const newMonthValues = [initialDateMonth, 5000];
      const newMonthResult = await client.query(newMonthQuery, newMonthValues);
    
      const newMonthRecord = newMonthResult.rows[0];
      console.log('Nuevo registro de ingresos mensuales creado:', newMonthRecord);
    } else {
      const updatedMonthRecord = monthResult.rows[0];
      console.log('Registro de ingresos mensuales actualizado:', updatedMonthRecord);
    }

    client.release();

    const newUser = result.rows[0];
    res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Ruta para agregar una rutina a la base de datos
router.post('/add-routine', async (req, res) => {
  try {
    // Obtener los datos de la rutina del cuerpo de la solicitud
    const { nombre, tipo_rutina, repeticiones, descripcion } = req.body;

    // Consulta SQL para insertar la rutina en la base de datos
    const insertQuery = 'INSERT INTO rutinas (nombre, tipo_rutina, repeticiones, descripcion) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [nombre, tipo_rutina, repeticiones, descripcion];
    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({ message: 'Rutina agregada exitosamente', data: rows[0] });
  } catch (error) {
    console.error('Error al agregar rutina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Rutas
router.post('/signin', async (req, res) => {
  const { dni, password } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM usuarios WHERE dni = $1', [dni]);
    const user = result.rows[0]; // Suponiendo que la consulta devuelve un único usuario
    client.release(); // Liberar el cliente después de la consulta

    if (!user) {
      return res.status(401).send("The dni doesn't exists");
    }

    // Verificar la contraseña (asegúrate de que password sea una cadena)
    if (user.password !== password.toString()) {
      return res.status(401).send("Wrong Password");
    }

    // Aquí generas el token JWT y lo envías como respuesta
    const token = jwt.sign({ dni: user.dni }, "secretkey");
    return res.status(200).json({ token, role: user.role });

  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    return res.status(500).send("Error interno del servidor");
  }
});

// Nueva ruta para obtener la información del usuario actual desde el private-admin
router.get('/current-user-data', verifyToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const dni = req.dni; // Se asume que el token contiene el dni del usuario
    const query = 'SELECT dni, nombres, apellidos, email, initial_date, final_date FROM usuarios WHERE dni = $1';
    const result = await client.query(query, [dni]);
    client.release();
    const userData = result.rows[0];
    
    if (!userData) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error getting current user data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Ruta para obtener los datos de ingresos mensuales
router.get("/monthly-earnings", async (req, res) => {
  try {
    const client = await pool.connect();
    const query = 'SELECT month, monthly_earnings FROM earnings ORDER BY month ASC';
    const result = await client.query(query);
    client.release();
    const monthlyEarnings = result.rows;

    res.status(200).json(monthlyEarnings);
  } catch (error) {
    console.error('Error getting monthly earnings data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Ruta para obtener los ingresos diarios desde PostgreSQL
router.get("/daily-earnings", async (req, res) => {
  try {
    const client = await pool.connect();
    const query = 'SELECT daily_earnings FROM daily_earnings ORDER BY created_at ASC';
    const result = await client.query(query);
    client.release();
    const dailyEarningsData = result.rows.map(row => row.daily_earnings);

    res.status(200).json({ dailyEarnings: dailyEarningsData });
  } catch (error) {
    console.error('Error getting daily earnings data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Ruta para agregar ingresos diarios
router.post("/add-daily-earnings", async (req, res) => {
  try {
    const { amount } = req.body;

    const client = await pool.connect();

    // Obtén el nombre del mes actual en español
    const monthsInSpanish = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentMonth = new Date().getMonth();
    const monthInSpanish = monthsInSpanish[currentMonth];

    // Encuentra o crea el registro de ingresos diarios en la tabla daily_earnings
    const findDailyEarningsQuery = 'SELECT * FROM daily_earnings';
    const findDailyEarningsResult = await client.query(findDailyEarningsQuery);

    // Encuentra o crea el registro de ingresos diarios en la tabla daily_earnings
    let dailyEarningDocumentOriginal;
    if (findDailyEarningsResult.rows.length === 0) {
      // Si no hay registro, inserta uno nuevo
      const insertDailyEarningsQuery = 'INSERT INTO daily_earnings (daily_earnings) VALUES ($1) RETURNING *';
      const insertDailyEarningsValues = [[amount.toString()]]; // Aquí asegúrate de que amount sea un número y no un array
      const insertDailyEarningsResult = await client.query(insertDailyEarningsQuery, insertDailyEarningsValues);
      dailyEarningDocumentOriginal = insertDailyEarningsResult.rows[0];
    } else {
      // Si ya hay un registro, actualiza el array de ingresos diarios
      const updateDailyEarningsQuery = 'UPDATE daily_earnings SET daily_earnings = array_append(daily_earnings, $1) RETURNING *';
      const updateDailyEarningsValues = [amount.toString()]; // Aquí asegúrate de que amount sea un número y no un array
      const updateDailyEarningsResult = await client.query(updateDailyEarningsQuery, updateDailyEarningsValues);
      dailyEarningDocumentOriginal = updateDailyEarningsResult.rows[0];
    }

    // Encuentra o crea el registro de ingresos diarios mensuales en la tabla monthly_earnings
    const findMonthlyEarningsQuery = 'SELECT * FROM daily_earning_month WHERE month = $1';
    const findMonthlyEarningsValues = [monthInSpanish];
    const findMonthlyEarningsResult = await client.query(findMonthlyEarningsQuery, findMonthlyEarningsValues);

    let monthlyEarningDocumentNew;
    if (findMonthlyEarningsResult.rows.length === 0) {
      // Si no hay registro, inserta uno nuevo
      const insertMonthlyEarningsQuery = 'INSERT INTO daily_earning_month (month, daily_earnings, total_earning) VALUES ($1, $2, $3) RETURNING *';
      const insertMonthlyEarningsValues = [monthInSpanish, [amount.toString()], amount.toString()];
      const insertMonthlyEarningsResult = await client.query(insertMonthlyEarningsQuery, insertMonthlyEarningsValues);
      monthlyEarningDocumentNew = insertMonthlyEarningsResult.rows[0];
    } else {
      // Si ya hay un registro, actualiza el array de ingresos mensuales y el total
      const updateMonthlyEarningsQuery = 'UPDATE daily_earning_month SET daily_earnings = array_append(daily_earnings, $1), total_earning = total_earning::numeric + $2 WHERE month = $3 RETURNING *';
      const updateMonthlyEarningsValues = [amount.toString(), parseFloat(amount), monthInSpanish];
      const updateMonthlyEarningsResult = await client.query(updateMonthlyEarningsQuery, updateMonthlyEarningsValues);
      monthlyEarningDocumentNew = updateMonthlyEarningsResult.rows[0];
    }

    client.release();

    // Retorna el documento guardado en la nueva base de datos como respuesta
    res.status(200).json({ daily_earnings: dailyEarningDocumentOriginal, daily_earning_month: monthlyEarningDocumentNew });
  } catch (error) {
    console.error('Error adding daily earnings:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Ruta para obtener todos los usuarios con el rol "user" desde PostgreSQL
router.get("/users", verifyToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM usuarios WHERE role = $1';
    const result = await client.query(query, ['user']);
    client.release();
    const users = result.rows;

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Ruta para eliminar un usuario
router.delete("/delete-user/:dni", verifyToken, async (req, res) => {
  const dni = req.params.dni;

  try {
    const client = await pool.connect();

    // Eliminar el usuario de la tabla usuarios
    const query = 'DELETE FROM usuarios WHERE dni = $1 RETURNING dni';
    const result = await client.query(query, [dni]);
    client.release();

    const deleted_dni = result.rows[0].dni;
    res.status(200).json(deleted_dni);
    // res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Ruta para eliminar una rutina de la base de datos
router.delete('/delete-routine/:id', async (req, res) => {
  const routineId = req.params.id;

  try {
    // Consulta SQL para eliminar la rutina de la base de datos
    const deleteQuery = 'DELETE FROM rutinas WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(deleteQuery, [routineId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' });
    }

    const deletedId = rows[0].id;
    res.status(200).json(deletedId);
    // res.status(200).json({ message: 'Rutina eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para eliminar todos los usuarios con rol "user"
router.delete("/delete-all-users", verifyToken, async (req, res) => {
  try {
    const client = await pool.connect();

    // Eliminar todos los usuarios con rol "user" de la tabla usuarios
    const query = 'DELETE FROM usuarios WHERE role = $1 RETURNING *';
    const result = await client.query(query, ['user']);
    client.release();

    const deletedUsers = result.rows;
    res.status(200).json({ message: `All ${deletedUsers.length} users with role "user" deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Ruta para eliminar todas las rutinas de la base de datos
router.delete('/delete-all-routines', async (req, res) => {
  try {
    // Consulta SQL para eliminar todas las rutinas de la base de datos
    const deleteQuery = 'DELETE FROM rutinas';
    await pool.query(deleteQuery);

    res.status(200).json({ message: 'Todas las rutinas eliminadas exitosamente' });
  } catch (error) {
    console.error('Error al eliminar todas las rutinas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


router.get('/users/:dni', verifyToken, async (req, res) => {
  try {
    const dni = req.params.dni;

    // Consulta SQL para buscar el usuario por DNI
    const userQuery = 'SELECT * FROM usuarios WHERE dni = $1';
    const { rows } = await pool.query(userQuery, [dni]);

    if (rows.length > 0) {
      const user = rows[0];
      // Verifica el rol del usuario
      if (user.role === 'user') {
        // Si tiene el rol 'user', envía los datos como respuesta
        res.status(200).json(user);
      } else if (user.role === 'admin') {
        // Si tiene el rol 'admin', envía un mensaje de error
        res.status(403).json({ message: 'Acceso no autorizado para administradores' });
      } else {
        // Si el rol no es ni 'user' ni 'admin'
        res.status(403).json({ message: 'Acceso no autorizado para este usuario' });
      }
    } else {
      // Si no se encuentra el usuario, envía una respuesta 404 (Not Found)
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    // Manejo de errores
    console.error('Error searching user by DNI:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para buscar rutinas por nombre en la base de datos
router.get('/routines/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre;

    // Consulta SQL para buscar rutinas por nombre similar
    const routinesQuery = `SELECT * FROM rutinas WHERE nombre ILIKE '%' || $1 || '%'`;
    const { rows } = await pool.query(routinesQuery, [nombre]);

    if (rows.length > 0) {
      // Si se encuentran rutinas con el nombre similar, enviar los datos como respuesta
      res.status(200).json(rows);
    } else {
      // Si no se encuentran rutinas con el nombre similar, enviar una respuesta 404 (Not Found)
      res.status(404).json({ message: 'No se encontraron rutinas similares' });
    }
  } catch (error) {
    // Manejo de errores
    console.error('Error buscando rutinas por nombre similar:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

//Ruta todos vencidos:
router.get("/users-vencidos", verifyToken, async (req, res) => {
  try {
    // Obtener la fecha actual y formatearla a 'MM/DD/YYYY'
    const currentDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    // Consultar en la base de datos los usuarios cuya fecha final ha expirado
    const expiredUsersQuery = 'SELECT * FROM usuarios WHERE final_date <= $1';
    const { rows: expiredUsers } = await pool.query(expiredUsersQuery, [currentDate]);

    res.status(200).json(expiredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/renew-user/:userDni", verifyToken, async (req, res) => {
  try {
    const userDni = req.params.userDni;

    // Obtener el usuario por ID
    const userQuery = 'SELECT * FROM usuarios WHERE dni = $1';
    const { rows } = await pool.query(userQuery, [userDni]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Obtener la fecha actual
    const currentDate = new Date();
    // Actualizar la fecha inicial
    const initial_date = currentDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    
    // Calcular la nueva fecha final sumando 1 mes
    const newFinalDate = new Date(currentDate);
    newFinalDate.setMonth(newFinalDate.getMonth() + 1);
    const final_date = newFinalDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    // Actualiza o crea el registro de ingresos mensuales
    const initialDateMonth = currentDate.toLocaleDateString('en-US', { month: 'short' });

    const monthQuery = `
      UPDATE earnings
      SET monthly_earnings = monthly_earnings + $1
      WHERE month = $2
      RETURNING *`;
    const monthValues = [5000, initialDateMonth];
    const monthResult = await pool.query(monthQuery, monthValues);
    
    if (monthResult.rows.length === 0) {
      // Si no hay registros para ese mes, se crea uno nuevo
      const newMonthQuery = `
        INSERT INTO earnings (month, monthly_earnings)
        VALUES ($1, $2)
        RETURNING *`;
      const newMonthValues = [initialDateMonth, 5000];
      const newMonthResult = await pool.query(newMonthQuery, newMonthValues);
    
      const newMonthRecord = newMonthResult.rows[0];
      console.log('Nuevo registro de ingresos mensuales creado:', newMonthRecord);
    } else {
      const updatedMonthRecord = monthResult.rows[0];
      console.log('Registro de ingresos mensuales actualizado:', updatedMonthRecord);
    }

    // Actualizar el usuario en la base de datos
    const updateUserQuery = 'UPDATE usuarios SET initial_date = $1, final_date = $2 WHERE dni = $3';
    const updateUserValues = [initial_date, final_date, userDni];
    await pool.query(updateUserQuery, updateUserValues);

    res.status(200).json({ message: "Usuario renovado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al renovar el usuario" });
  }
});


router.put("/update-user/:dni", verifyToken, async (req, res) => {
  const userDni = req.params.dni;
  const { dni, nombres, apellidos, email, initial_date } = req.body;
  let adjustedFinalDate = null;

  try {
    let userToUpdate = { dni, nombres, apellidos, email };

    // Verificar si initial_date ha sido modificado
    if (initial_date) {
      const oldUserQuery = 'SELECT initial_date FROM usuarios WHERE dni = $1';
      const { rows } = await pool.query(oldUserQuery, [userDni]);
      const oldInitial_date = rows[0].initial_date;

      if (initial_date !== oldInitial_date) {
        const current_date = new Date(initial_date);
        current_date.setMonth(current_date.getMonth() + 1);
        adjustedFinalDate = current_date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

        userToUpdate = { ...userToUpdate, initial_date, final_date: adjustedFinalDate };
      }
    }

    const updateUserQuery = 'UPDATE usuarios SET dni = $1, nombres = $2, apellidos = $3, email = $4, initial_date = $5 WHERE dni = $6 RETURNING *';
    const values = [dni, nombres, apellidos, email, initial_date, userDni];
    const { rows } = await pool.query(updateUserQuery, values);

    res.status(200).json({ message: 'User updated successfully', data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//////////////////RUTINASSSSSSSSSSSSSSSSSSS
router.get("/routines", verifyToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM rutinas';
    const { rows: rutinas } = await pool.query(query);

    res.status(200).json(rutinas);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Ruta para actualizar una rutina en la base de datos
router.put("/update-routine/:id", async (req, res) => {
  const routineId = req.params.id;
  const { nombre, tipo_rutina, repeticiones, descripcion } = req.body;

  try {

    // Consulta SQL para actualizar la rutina en la base de datos
    const updateQuery = 'UPDATE rutinas SET nombre = $1, tipo_rutina = $2, repeticiones = $3, descripcion = $4 WHERE id = $5 RETURNING *';
    const values = [nombre, tipo_rutina, repeticiones, descripcion, routineId];
    const { rows } = await pool.query(updateQuery, values);

    // Verificar si se actualizó alguna rutina
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' });
    }

    res.status(200).json({ message: 'Rutina actualizada exitosamente', data: rows[0] });
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

//Asignar rutina
router.put("/applyRoutine-user/:userDni", verifyToken, async (req, res) => {
  const userDni = req.params.userDni;
  const idRoutine = req.body.IdRoutine;

  // Verifica que se hayan proporcionado los datos necesarios
  if (!userDni || !idRoutine) {
    return res.status(400).json({ error: 'Faltan datos para completar la asignación de rutina.' });
  }

  try {
    // Inserta la asignación de rutina en la base de datos
    const query = 'INSERT INTO asignarRutina (id_rutina, dni_usuario) VALUES ($1, $2)';
    const result = await pool.query(query, [idRoutine, userDni]);

    return res.status(200).json({ message: 'Asignación de rutina guardada exitosamente' });
  } catch (error) {
    console.error('Error al guardar la asignación de rutina:', error);
    return res.status(500).json({ error: 'Error al guardar la asignación de rutina' });
  }
  
});

// Ruta para obtener las rutinas de un usuario por DNI
router.get('/getUserRoutines/:dni', async (req, res) => {
  const dni = req.params.dni;

  try {
    // Consulta SQL para obtener las rutinas del usuario por su DNI
    const query = 'SELECT r.id, r.nombre, r.tipo_rutina, r.repeticiones, r.descripcion FROM rutinas r INNER JOIN asignarRutina a ON r.id = a.id_rutina WHERE a.dni_usuario = $1';
    const result = await pool.query(query, [dni]);

    // Verificar si se encontraron rutinas para el usuario
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(200).json();
    }
  } catch (error) {
    console.error('Error al obtener las rutinas del usuario:', error);
    res.status(500).json({ error: 'Error al obtener las rutinas del usuario.' });
  }
});


module.exports = router;

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized Request");
  }

  const token = req.headers.authorization.split(" ")[1];
  if (token === "null") {
    return res.status(401).send("Unauthorized Request");
  }

  try {
    const payload = jwt.verify(token, "secretkey");
    req.dni = payload.dni; // Se asume que el token contiene el DNI del usuario
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send("Unauthorized Request");
  }
}
