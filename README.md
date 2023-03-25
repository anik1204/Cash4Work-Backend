# Cash4Work-Backend

# Calling APIs

- /user/signup
  - need to include the following objects in the body { fname, lname, email, password, dob }
  - dob needs to be in YYYY-MM-DD format
  - POST request only
  - server will send the appropriate success/error message in response.
- /user/login

  - need to include the following objects in the body { email, password }
  - POST request only
  - if login is successful, server will send an access token
  - otherwise, it will send an error message.

- /user/verify

  - need to include the following objects in the body { email, token }
  - POST request only
  - server will send user object if token is valid
  - otherwise, it will send an error message

- /rating (POST request for inserting, GET request for querying)
  - need to include the following objects in the body {user_id, rated_by, rating, comment}
  - to query the rating of a user, send a GET request to /rating/:user_id (e.g. /rating/1)
  
- /jobs (POST request for inserting, GET request for querying)
  - need to include the following objects in the body { title, posted_by, description, location, salary, need_on }
  - location needs to be valid
  - to query a job send a GET request to /jobs/:job_id (e.g. /jobs/1)
  
- /jobs/apply
  - POST request only
  - need to include { job_id, applied_by }
  - applied_by should be the id of the user who is applying

- /jobs/applied/:userId
  - GET Request only
  - returns all the jobs user has applied to
