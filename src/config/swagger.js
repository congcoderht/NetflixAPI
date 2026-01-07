const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Only use the generated swagger_output.json from swagger-autogen
const swaggerOutputPath = path.resolve(__dirname, '../../swagger_output.json');

const swaggerSetup = (app) => {
  if (!fs.existsSync(swaggerOutputPath)) {
    console.warn('⚠️ swagger_output.json not found. Generate it with: npm run swagger:gen');

    // Informative endpoints when JSON missing
    app.get('/api-docs', (req, res) => {
      res.status(503).send('<h3>Swagger JSON not generated</h3><p>Run <code>npm run swagger:gen</code> to generate <code>swagger_output.json</code>.</p>');
    });

    app.get('/api-docs.json', (req, res) => {
      res.status(503).json({ error: 'swagger_output.json not found. Run npm run swagger:gen' });
    });

    return;
  }

  try {
    delete require.cache[require.resolve(swaggerOutputPath)];
  } catch (e) { /* ignore */ }
  const spec = require(swaggerOutputPath);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, {
    explorer: true,
    swaggerOptions: { persistAuthorization: true },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Netflix API Documentation'
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  });
};

module.exports = swaggerSetup;
