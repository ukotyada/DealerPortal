const express = require('express');
const app = express();
const expressSwagger = require('express-swagger-generator')(app);
 
let options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        basePath: '/',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https']
    },
    basedir: '.', //app absolute path
    files: ['/app.js'] //Path to the API handle folder
};
expressSwagger(options)
app.listen(3000);