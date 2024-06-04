const express = require("express");
const http = require('http');
const path = require('path');
const cors = require("cors");
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const upload = multer();

require('dotenv').config();
const app = express();
const { sequelize, user_groups } = require("./app/Database/index")

const { userRoutes, controllerRoutes } = require('./app/routes');
const { ROLES } = require("./app/config/enum");


/**App Setup */
app.use(upload.any());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/templates"));
app.use('/', express.static('uploads'));

// Set Cookie Parser, sessions and flash
app.use(cookieParser('NotSoSecret'));
app.use(session({
    secret: 'something',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(function (req, res, next) {
    res.locals.message = req.flash();
    next();
});



/**All Route */

app.use('/api/user', userRoutes)
app.use('/api', controllerRoutes)


app.get("/", (req, res) => res.render("welcome"))


/**Server Starting */
const force = false;
const alter = false;
const httpServer = http.createServer(app)

httpServer.listen(process.env.BACKEND_PORT, () => {
    console.log("Server is running on PORT : ", process.env.BACKEND_PORT)
    sequelize.sync({ force, alter }).then(async () => {
        console.log("Drop and re-sync db.");

        if (force) {
            const obj = [{
                id: 1,
                title: "Super Admin",
                slug: "super-admin",
                type: ROLES.ADMIN,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                title: "App User",
                slug: "app-user",
                type: ROLES.USER,
                createdAt: new Date(),
                updatedAt: new Date()
            }]
            const record = await user_groups.bulkCreate(obj)
            console.log("User Groups Records Created ! ")
        }

        require("./app/config/validator");
    });

})