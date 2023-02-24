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

- /rating (POST request for inserting, GET request for querying)
  - need to include the following objects in the body {user_id, rated_by, rating, comment}
  - to query the rating of a user, send a GET request to /rating/:user_id (e.g. /rating/1)
