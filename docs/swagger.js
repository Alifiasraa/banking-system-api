const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Banking System API",
      description: "",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./docs/*.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);

// function swaggerDocs(app) {
//   app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// }

module.exports = swaggerSpec;
