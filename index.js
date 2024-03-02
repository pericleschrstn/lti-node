require("dotenv").config();
const path = require("path");
const routes = require("./src/routes");

const lti = require("ltijs").Provider;

// Setup
lti.setup(
  process.env.LTI_KEY,
  {
    url: process.env.DB_CONNECTION_STRING,
    // connection: { user: process.env.DB_USER, pass: process.env.DB_PASS },
  },
  {
    staticPath: path.join(__dirname, "./public"), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: "None", // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: false, // Set DevMode to true if the testing platform is in a different domain and https is not being used
  }
);

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  // const url = "https://lti-psi.vercel.app/";

  // res.writeHead(302, { Location: url });
  // res.end();
  return res.sendFile(path.join(__dirname, "./public/index.html"));
});

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, "/deeplink", { newResource: true });
});

// Setting up routes
lti.app.use(routes);

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT });

  await lti.registerPlatform({
    url: "https://canvas.test.instructure.com",
    name: "Canvas",
    clientId: "247230000000000103",
    authenticationEndpoint: "https://sso.test.canvaslms.com/api/lti/authorize_redirect",
    accesstokenEndpoint: "https://sso.test.canvaslms.com/login/oauth2/token",
    authConfig: { method: "JWK_SET", key: "https://sso.test.canvaslms.com/api/lti/security/jwks" },
  });
};

setup();
