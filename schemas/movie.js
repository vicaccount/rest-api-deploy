const z = require('zod')

const MovieSchema = z.object({
  title: z.string({
    invalid_type_error: 'title must be a string',
    required_error: 'title is required'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().positive().int(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poste must be a valid url'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required.',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie (movie) {
  return MovieSchema.safeParse(movie)
}

function validatePartialMovie (movie) {
  return MovieSchema.partial().safeParse(movie)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
