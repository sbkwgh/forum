# forum-backend

This is the backend (or 'api component') of the forum software to go along with the corresponding [frontend project](//github.com/sbkwgh/forum-frontend).

# API Documentation

All API routes are prefixed `/api/v1/`

## /admin_token
All sub-routes require admin privileges

### /
* Method: `POST`
* Response:
  ```
    {
        id: <integer>,
        token: <string>
    }
  ```

## /ban
All sub-routes require admin privileges

### /
* Method: `POST`
* Data params:
  * message \<string>
  * username: \<string>
  * canCreateThreads \<boolean>
  * canCreatePosts \<boolean>
  * ipBanned \<boolean>
* Response:
  ```
  {
      id: <integer>,
      message: <string>,
      canCreateThreads: <boolean>,
      canCreatePosts: <boolean>,
      ipBanned: <boolean>,
      User: {
        id: <integer>,
        username: <string>,
        description: <null | string>,
        color: <string>,
        createdAt: <string>
      }
  ```

### /
 * Method: `GET`
 * Response:
   ```
   [{
       id: <integer>,
       createdAt: <string>,
       updatedAt: <string>,
       canCreatePosts: <boolean>,
       canCreateThreads: <boolean>,
       ipBanned: <boolean>,
       message: <string>,
       UserId: <integer>
   }, ...]
   ```
   
### /:id
 * Method: `DELETE`
 * URL params: id \<integer>
 * Response:
   ```
   { success: true }
   ```
