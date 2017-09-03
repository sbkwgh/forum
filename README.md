# forum-backend

This is the backend (or 'api component') of the forum software to go along with the corresponding [frontend project](//github.com/sbkwgh/forum-frontend).

# API Documentation

All API routes are prefixed `/api/v1/`

## /admin_token

### /
* Method: `POST`
* Response:
  ```
    {
        id: <integer>,
        token: <string>
    }
  ```
* Notes: requires admin privileges

## /ban

### /
* Method: `GET`
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
 * Notes: requires admin privileges
