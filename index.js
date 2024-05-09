const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()
const Persons = require("./models/persons")
app.use(express.json())
app.use(cors())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))
app.use(express.static("dist"))

morgan.token("body", (req) => JSON.stringify(req.body))

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:", request.path)
  console.log("Body:", request.body)
  console.log("---")
  next()
}

app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.get("/api/persons", (request, response) => {
  Persons.find({}).then(persons => {
    response.json(persons)
  })
})

app.get("/api/persons/:id", (request, response) => {
  Persons.findById(request.params.id).then(persons => {
    response.json(persons)
  })
  .catch(error => next(error))
})

app.get("/info", async (request, response, next) => {
  const currentDate = new Date().toLocaleString()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const count = await Persons.countDocuments({"name": {$in:
  []}})
  response.send(
    `<div>
      <p>Phonebook has info for ${count} people</p>
    </div>
    <div>
      <p>${currentDate} (${timeZone})</p>
    </div>`
  )
  .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response) => {
  const {id} = request.params
  Persons.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body
  
  if (body.name === undefined) {
    return response.status(400).json({
      error: "name missing"
    })
  } else if (body.number === undefined) {
    return response.status(400).json({
      error: "number missing"
    })
  }

  const newPerson = new Persons({
    name: body.name,
    number: body.number || false,
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body

  Persons.findByIdAndUpdate(request.params.id, {name, number}, {new: true, runValidators:true, context: "query"}).then(result => {
    response.json(result)
  })
  .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({error: "malformatted id"})
  } else if (error.name === "ValidationError") {
    return response.status(400).json({error: error.message})
  } else if (error.number === "ValidationError") {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})