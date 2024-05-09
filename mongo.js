const mongoose = require('mongoose')

if (process.argv.length<2) {
  console.log('give at least a password, name and number as argument')
  process.exit(1)
} 

const password = process.argv[2]
const personsName = process.argv[3]
const personsNumber = process.argv[4]

const url =
`mongodb+srv://martinsito:${password}@cluster0.31pc8jn.mongodb.net/Phonebook?
retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: Number,
  })

const Persons = mongoose.model('Persons', noteSchema)

if (process.argv.length === 5) {
  const persons = new Persons({
    name: personsName,
    number: personsNumber,
  })

  persons.save().then(result => {
    console.log(`Added ${personsName}, number ${personsNumber} to the phonebook.`)
    mongoose.connection.close()
  })
} else {
  Persons.find({}).then(result => {
    result.forEach(persons => {
      console.log(persons)
    })
    mongoose.connection.close()
    })
}





