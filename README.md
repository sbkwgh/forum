# Vue Forum

Simple and beautiful forum software - created using Express, Vue, and Sequelize.

![forum-screenshot](https://user-images.githubusercontent.com/5166028/30886924-15a8bff8-a311-11e7-9833-981d60e0cd41.png)

To install on Heroku:

 1. `git clone https://github.com/sbkwgh/forum.git`
 2. `heroku login`
 3. `heroku git:remote -a <app-name>`
 4. `heroku config:set NODE_ENV=production`
 5. `heroku config:set SESSION_SECRET=<session-secret>`
 6. Add database add-on, get database URL
 7. `heroku config:set DATABASE_URL=<database-url>`
 8. `cd frontend && npm install`
 9. `npm run build`
 10. Remove the line `dist/` from `.gitignore`
 11. `cd .. && git add -A && git commit -m "Update .gitignore"`
 12. `git push heroku master`
 13. Visit the URL of the app and complete the on-screen instructions

N.B. the database here is assumed to be MySQL - to use Postgres or another you must install the corresponding driver on npm
