import { useEffect, useState } from 'react'
import personService from './services/persons'
import './index.css'

const Filter = ({value, onChange}) => (
  <div>filter shown with <input value={value} onChange={onChange}></input></div>
)

const PersonForm = ({onSubmit, nameValue, numberValue, onNameChange, onNumberChange}) => (
  <form onSubmit={onSubmit}>
    <div>name: <input value={nameValue} onChange={onNameChange}/></div>
    <div>number: <input value={numberValue} onChange={onNumberChange}/></div>
    <div><button type="submit">add</button></div>
  </form>
)

const Person = ({person, delPerson}) => (
  <div>
    {person.name} {person.number} <button onClick={() => delPerson(person.id)}>delete</button>
  </div>
)

const Persons = ({persons, delPerson}) => (
  <div>
    {persons.map(person =>
        <Person key={person.id} person={person} delPerson={delPerson}/>
    )}
  </div>
)

const Notification = ({ message, error, setMessage }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(null)
    }, 5000)
    return () => clearTimeout(timer)
  })

  if (message === null) {
    return null
  }

  if (error) {
    return (
      <div className="error notification">
        {message}
      </div>
    )
  }
  else {
    return (
      <div className="success notification">
        {message}
      </div>
    )
  }
}

const App = () => {
  const [persons, setPersons] = useState([])

  useEffect(() => {
    personService
      .getAll()
      .then(notes => {
        setPersons(notes)
      })
  }, [])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(false)

  const personsToShow = filter ? persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase())) : persons

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()

    for (const person of persons) {
      if (newName === person.name) {
        if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
          const changedPerson = { ...person, number: newNumber }
          personService
            .update(person.id, changedPerson)
            .then(responsePerson => {
              setPersons(persons.map(p => p.id !== responsePerson.id ? p : responsePerson))
              setError(false)
              setMessage(`Modified ${newName}`)
              setNewName('')
              setNewNumber('')
            })
            .catch(error => {
              setError(true)
              setMessage(`Information of ${newName} has already been removed from server`)
              setPersons(persons.filter(p => p.id !== person.id))
            })
        }
        return
      }
    }

    const personObject = {
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setError(false)
        setMessage(`Added ${newName}`)
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        setError(true)
        setMessage(error.response.data.error)
      })
  }

  const delPerson = (id) => {
    const name = persons.find(person => person.id === id).name
    if (window.confirm(`Delete ${name} ?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setError(false)
          setMessage(`Deleted ${name}`)
        })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} error={error} setMessage={setMessage} />
      <Filter value={filter} onChange={handleFilterChange} />
      <h2>add a new</h2>
      <PersonForm onSubmit={addPerson} nameValue={newName} numberValue={newNumber} onNameChange={handleNameChange} onNumberChange={handleNumberChange} />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} delPerson={delPerson}/>
    </div>
  )
}

export default App
