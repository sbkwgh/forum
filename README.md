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
  * `message <string>`
  * `username <string>`
  * `canCreateThreads <boolean>`
  * `canCreatePosts <boolean>`
  * `ipBanned <boolean>`
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
 * URL params: `id <integer>`
 * Response:
   ```
   { success: true }
   ```

### /category

### /
 * Method: `GET`
 * Reponse:
   ```
   [{
       color: <string>,
       createdAt: <string>,
       id: <integer>,
       name: <string>,
       updatedAt: <string>,
       value: <string>
   }, ...]
   ```

### /:category
 * Method: `GET`
 * URL params: `category <string>`
 * Query params:
   * `username <string, optional>`
   * `from <integer, optional>`
   * `limit <integer, optional>`
* Response:
  ```
  {
      name: <string>,
      value: <string>,
      color: <string>,
      [id: <integer>],
      [createdAt: <string>],
      [updatedAt: <string>],
      Threads: [ ... ],
      meta: {
         nextURL: <string | null>,
         nextThreadsCount: <integer>
      }
  }
  ```
  
### /
* Method: `POST`
* Data params:
  * `name <string>`
  * `color <string, optional>`
* Response:
  ```
  {
      color: <string>,
      createdAt: <string>,
      id: <integer>,
      name: <string>,
      updatedAt: <string>,
      value: <string>
  }
  ```
* Notes: requires admin privileges

### /:id
* Method: `PUT`
* URL params: `id <integer>`	
* Data params:
  * `name <string, optional>`
  * `color <string, optional>`
* Response:
  ```
  {
      color: <string>,
      createdAt: <string>,
      id: <integer>,
      name: <string>,
      updatedAt: <string>,
      value: <string>
  }
  ```
* Notes: requires admin privileges

### /
* Method: `DELETE`
* URL params: `id <integer>`
* Response:
  ```
  {
      success: true,
      otherCategoryCreated: <category object | null>
  }
  ```
* Notes: requires admin privileges
