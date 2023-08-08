const PORT = process.env.PORT || 8000
const express = require('express')
const app = express()
const pool = require('./db')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const validate = require('./validate.js');

app.use(cors());
app.use(express.json())

// if(process.env.NODE_ENV === "production") {
//     // server static content
//     app.use(express.static(path.join(_dirname, 'client/build')))
// }

const validateEmailAndPassword = validate.validateEmailAndPassword;
const validateEmail = validate.validateEmail;
const validateToDo = validate.validateToDo;

// get all todos
app.get('/getTodos/:userEmail', async (req, res) => {
    const { userEmail } = req.params;

    const validationResults = validateEmail(userEmail);
    if (!validationResults.valid) {
        res.status(500).json({ message: validationResults.error });
        return;
    }
    try {
        const todos = await pool.query('SELECT * FROM todos WHERE user_email = $1', [userEmail])
        res.json(todos.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// create new todo
app.post('/todos', async (req, res) => {
    const {user_email, title, progress, date} = req.body
    
    const validationResults = validateToDo(user_email, title);
    if (!validationResults.valid) {
        res.status(500).json({ message: validationResults.error });
        return;
    }
    
    try {
        const newTodo = await pool.query(`INSERT INTO todos (user_email, title, progress, date) VALUES ($1, $2, $3, $4)`, 
        [user_email, title, progress, date], (error, result) => {
            if (error) {
                return res.status(500).send({
                    message: err
                })
            }
            res.status(200).send({
                message: 'todo added',
                data: result.rows
            })
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'An error occurred' });
    }
})

// edit todo
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params
    const { user_email, title, progress, date } = req.body
    
    const validationResults = validateToDo(user_email, title);
    if (!validationResults.valid) {
        res.status(500).json({ message: validationResults.error });
        return;
    }

    try {
        const editTodo = await pool.query(`UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5;`, [user_email, title, progress, date, id])
        res.json(editTodo)
    } catch (error) {
        console.error(error)
    }
})

// delete a todo 
app.delete('/todos/:id' , async (req, res) => {
    const {id} = req.params
    try {
        const deleteTodo = await pool.query(`DELETE FROM todos WHERE id = $1;`, [id])
        res.json(deleteTodo)

    } catch (error) {
        console.error(error)
    }
})

// signup 
app.post('/signup', async (req, res) => {
    const {email, password} = req.body;
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    const validationResults = validateEmailAndPassword(email, password);
    if (!validationResults.valid) {
        res.status(500).json({ message: validationResults.error });
        return;
    }

    try {
        const signup = await pool.query(`INSERT INTO users (email, hashed_password) VALUES ($1, $2)`, [email, hashedPassword])
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' })
        res.json({ email, token })
    } catch (err) {
        if (err) {
            console.error('signup error:',err)
            res.status(500).json({ data: err.detail })
        }
    }
})

// login
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    // console.log('test req: ', req.body)

    const validationResults = validateEmailAndPassword(email, password);
    if (!validationResults.valid) {
        res.status(500).json({ message: validationResults.error });
        return;
    }

    try {
      const users = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
      if (!users.rows.length) return res.status(500).json({ message: 'User does not exist!'})
      const success = await bcrypt.compare(password, users.rows[0].hashed_password)
      const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' })
      if (success) {
        res.json({'email': users.rows[0].email, token })
      } else {
        res.status(500).json({ message: 'Login failed!' })
      }
    } catch (err) {
        console.error(err)
    }
})


app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))

module.exports = app