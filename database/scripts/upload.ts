import parse from 'csv-parse/lib/sync'
import fs from 'fs'
import assert from 'assert'
import { bulkAddMembers } from '../congregation'
import { APPOINTMENTS, GENDERS, SUPPORTED_LANGUAGES } from '../../src/constants'
import { ICongregationMember, Genders, Languages, Appointments } from 'types'

type BooleanString = 'Y' | 'y' | ''

interface IColumn {
  name: string
  appointment: Appointments
  gender: Genders
  languageGroup: Languages
  show: BooleanString
  'privileges.chairman': BooleanString
  'privileges.highlights': BooleanString
  'privileges.gems': BooleanString
  'privileges.serviceTalk': BooleanString
  'privileges.congregationBibleStudy': BooleanString
  'privileges.reader': BooleanString
  'privileges.prayer': BooleanString
  'privileges.bibleReading': BooleanString
  'privileges.ministryVideo': BooleanString
  'privileges.initialCall': BooleanString
  'privileges.initialCallAssist': BooleanString
  'privileges.returnVisit': BooleanString
  'privileges.returnVisitAssist': BooleanString
  'privileges.bibleStudy': BooleanString
  'privileges.bibleStudyAssist': BooleanString
  'privileges.studentTalk': BooleanString
}

type ColumnNames = keyof IColumn

interface IColumnHeader {
  name: ColumnNames
  noDuplicates?: boolean
  allowedValues?: readonly string[]
  boolean?: boolean
}

type Duplicates = { [key in ColumnNames]: string[] }

const filename = process.argv[2]
if (!filename) throw new Error('No file argument provided')

console.log('Loading File...')

const file = fs.readFileSync(filename)
const data: IColumn[] = parse(file, {
  columns: true
})

console.log('File Loaded, Validating...')

/* Data Sanity Checks */
const columns: IColumnHeader[] = [
  { name: 'name', noDuplicates: true },
  { name: 'appointment', allowedValues: APPOINTMENTS },
  { name: 'gender', allowedValues: GENDERS },
  { name: 'languageGroup', allowedValues: SUPPORTED_LANGUAGES.map(({ value }) => value) },
  { name: 'show', boolean: true },
  { name: 'privileges.chairman', boolean: true },
  { name: 'privileges.highlights', boolean: true },
  { name: 'privileges.gems', boolean: true },
  { name: 'privileges.serviceTalk', boolean: true },
  { name: 'privileges.congregationBibleStudy', boolean: true },
  { name: 'privileges.reader', boolean: true },
  { name: 'privileges.prayer', boolean: true },
  { name: 'privileges.bibleReading', boolean: true },
  { name: 'privileges.ministryVideo', boolean: true },
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
const noDuplicateColumns = columns.reduce((acc: ColumnNames[], { name, noDuplicates }) => noDuplicates ? acc.concat(name) : acc, [])
const duplicates = columns.reduce((acc, { name }) => Object.assign(acc, { [name]: [] }), {}) as Duplicates
for (const row of data) {
  // No duplicates in noDuplicate columns
  for (const name of noDuplicateColumns) {
    const duplicatesArray = duplicates[name]
    const rowValue = row[name]
    assert.strictEqual(duplicatesArray.includes(rowValue), false, `Duplicate Value In Field "${name}": ${rowValue}`)
    duplicatesArray.push(rowValue)
  }

  // Fields are restricted to their value lists
  for (const { name, allowedValues } of columns) {
    if (!allowedValues) continue
    const rowValue = row[name]
    assert(allowedValues.includes(rowValue), `Invalid Value In Field "${name}": ${rowValue}`)
  }
}

console.log('File Valid, Converting...')

const members: ICongregationMember[] = data.map(row => ({
  _id: '',
  name: row.name,
  appointment: row.appointment,
  gender: row.gender,
  languageGroup: row.languageGroup,
  show: !!row.show,
  school: null,
  privileges: {
    chairman: !!row['privileges.chairman'],
    highlights: !!row['privileges.highlights'],
    gems: !!row['privileges.gems'],
    serviceTalk: !!row['privileges.serviceTalk'],
    congregationBibleStudy: !!row['privileges.congregationBibleStudy'],
    reader: !!row['privileges.reader'],
    prayer: !!row['privileges.prayer'],
    bibleReading: !!row['privileges.bibleReading'],
    ministryVideo: !!row['privileges.ministryVideo'],
    initialCall: !!row['privileges.initialCall'],
    initialCallAssist: !!row['privileges.initialCallAssist'],
    returnVisit: !!row['privileges.returnVisit'],
    returnVisitAssist: !!row['privileges.returnVisitAssist'],
    bibleStudy: !!row['privileges.bibleStudy'],
    bibleStudyAssist: !!row['privileges.bibleStudyAssist'],
    studentTalk: !!row['privileges.studentTalk']
  }
}))

console.log('File Converted, Uploading...')

bulkAddMembers(members)
  .then(() => {
    console.log('Upload Complete')
    process.exit()
  })
  .catch(console.error)
