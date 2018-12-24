import parse from 'csv-parse/lib/sync'
import fs from 'fs'
import assert from 'assert'
import { bulkAddMembers } from './congregation'

const filename = process.argv[2]
if (!filename) throw new Error('No file argument provided')

console.log('Loading File...')

const file = fs.readFileSync(filename)
const data = parse(file, {
  columns: true
})

console.log('File Loaded, Validating...')

/* Data Sanity Checks */
const columns = [
  { name: 'name', noDuplicates: true },
  { name: 'abbreviation', noDuplicates: true },
  { name: 'appointment', allowedValues: ['Brother', 'Sister', 'Ministerial Servant', 'Elder', ''] },
  { name: 'gender', allowedValues: ['Male', 'Female'] },
  { name: 'languageGroup', allowedValues: ['English', 'Portuguese'] },
  { name: 'show', boolean: true },
  { name: 'privileges.chairman', boolean: true },
  { name: 'privileges.highlights', boolean: true },
  { name: 'privileges.gems', boolean: true },
  { name: 'privileges.serviceTalk', boolean: true },
  { name: 'privileges.bookStudy', boolean: true },
  { name: 'privileges.reader', boolean: true },
  { name: 'privileges.prayer', boolean: true },
  { name: 'privileges.bibleReading', boolean: true },
  { name: 'privileges.initialCall', boolean: true },
  { name: 'privileges.initialCallAssist', boolean: true },
  { name: 'privileges.returnVisit', boolean: true },
  { name: 'privileges.returnVisitAssist', boolean: true },
  { name: 'privileges.bibleStudy', boolean: true },
  { name: 'privileges.bibleStudyAssist', boolean: true },
  { name: 'privileges.studentTalk', boolean: true }
]
const booleanValues = ['Y', 'y', '']
const booleanColumns = columns.filter(c => c.boolean)
booleanColumns.forEach(column => Object.assign(column, { allowedValues: booleanValues }))

// Rows exist
assert(data.length, 'No Data Found')

// Correct headers
const rowKeys = Object.keys(data[0]).sort()
const expectedKeys = columns.map(({ name }) => name).sort()
assert.deepStrictEqual(rowKeys, expectedKeys, 'Column Names Do Not Match')

// Examining every row...
const noDuplicateColumns = columns.reduce((acc, { name, noDuplicates }) => noDuplicates ? acc.concat(name) : acc, [])
const duplicates = noDuplicateColumns.reduce((acc, name) => Object.assign(acc, { [name]: [] }), {})
const restrictedColumns = columns.filter(c => c.allowedValues)
for (const row of data) {
  // No duplicates in noDuplicate columns
  for (const name of noDuplicateColumns) {
    const duplicatesArray = duplicates[name]
    const rowValue = row[name]
    assert.strictEqual(duplicatesArray.includes(rowValue), false, `Duplicate Value In Field "${name}": ${rowValue}`)
    duplicatesArray.push(rowValue)
  }

  // Fields are restricted to their value lists
  for (const { name, allowedValues } of restrictedColumns) {
    const rowValue = row[name]
    assert(allowedValues.includes(rowValue), `Invalid Value In Field "${name}": ${rowValue}`)
  }
}

console.log('File Valid, Converting...')

for (const row of data) {
  // Convert Boolean Values
  for (const { name } of booleanColumns) {
    Object.assign(row, { [name]: !!row[name] })
  }

  // Properly Nest Values
  Object.keys(row).forEach(key => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      row[parent] = Object.assign(row[parent] || {}, { [child]: row[key] })
      delete row[key]
    }
  })
}

console.log('File Converted, Uploading...')

bulkAddMembers(data)
  .then(() => {
    console.log('Upload Complete')
    process.exit()
  })
  .catch(console.error)
