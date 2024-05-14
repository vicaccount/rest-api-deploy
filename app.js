const express = require('express')
const cripto = require('node:crypto')
const movies = require('./resources/movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movie')
const cors = require('cors')

const PORT = process.env.PORT ?? 3000
const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://127.0.0.1:5500',
      'http://localhost:8080'
    ]
    if (ACCEPTED_ORIGINS.includes(origin)) return callback(null, true)
    if (!origin) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/', (request, response) => {
  response.json({ message: 'Hola mundo' })
})

app.get('/movies', (req, res) => {
  const { genre } = req.query
  let filteredMovies
  if (genre) {
    filteredMovies = movies.filter((movie) =>
      movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
  }
  // res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
  res.json(filteredMovies ?? movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((m) => m.id === id)
  if (!movie) {
    return res.status(404).json({ message: 'Película no encontrada' })
  }
  res.json(movie)
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ errors: JSON.parse(result.error.message) })
  }

  // En base de datos
  const newMovie = {
    id: cripto.randomUUID(),
    ...result.data
  }
  // Esto no sería REST, porque estamos guardando el estado de la aplicación en memoria
  movies.push(newMovie)
  // Enviando respuesta
  res.status(201).json(newMovie) // Actualizar la caché del cliente
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (result.error) {
    return res.status(400).json({ errors: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(m => m.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = updatedMovie
  return res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  // res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
  const movieIndex = movies.findIndex(m => m.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  movies.splice(movieIndex, 1)
  res.json({ message: 'Movie deleted' })
})

// app.options('/movies/:id', (req, res) => {
//   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
//   res.sendStatus(204)
// })

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el http://localhost:${PORT}`)
})
