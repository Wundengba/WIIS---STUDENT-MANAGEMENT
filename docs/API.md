# Ghana Placement System — REST API Reference

Base URL: `http://localhost:5000/api`

## Students

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | /students         | List all students    |
| GET    | /students/:id     | Get one student      |
| POST   | /students         | Enroll student       |
| PATCH  | /students/:id     | Update student       |
| DELETE | /students/:id     | Remove student       |

### POST /students body
```json
{
  "full_name": "Kwame Mensah",
  "index_number": "000000000001",
  "gender": "Male",
  "dob": "2008-03-15",
  "parent_contact": "0244000000"
}
```

## Scores

| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| GET    | /scores/student/:studentId      | All scores for student  |
| POST   | /scores                         | Upsert a score          |

### POST /scores body
```json
{ "student_id": "uuid", "subject": "Mathematics", "score": 78 }
```

## Selections

| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| GET    | /selections                     | All submissions         |
| GET    | /selections/student/:studentId  | Student's selection     |
| POST   | /selections                     | Submit selection        |
| PATCH  | /selections/:id/review          | Approve / reject        |

### POST /selections body
```json
{ "student_id": "uuid", "choices": [1, 7, 23, 65, 101, 150, 301] }
```

### PATCH /selections/:id/review body
```json
{ "status": "approved", "reason": "" }
```
