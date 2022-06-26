const approuter = require("@sap/approuter");
const jwtDecode = require("jwt-decode");
let ar = approuter();

ar.first.use((req, res, next) => {
    console.log("first: The following request was made...");
    console.log("first: Method: ", req.method);
    console.log("first: URL: ", req.url);
    console.log("first: Tenant host: ", process.env.TENANT_HOST);
  
    if (req.user && req.user.token && req.user.token.accessToken) {
      let decodedJWTToken = jwtDecode(req.user.token.accessToken);
      console.log("first: Decoded token: ", decodedJWTToken);
    } else {
      console.log("first: No token available for the request...");
    }
  
    next();
  });

ar.beforeRequestHandler.use((req, res, next) => {
  console.log("beforeRequestHandler: The following request was made...");
  console.log("beforeRequestHandler: Method: ", req.method);
  console.log("beforeRequestHandler: URL: ", req.url);

  if (req.user && req.user.token && req.user.token.accessToken) {
    let decodedJWTToken = jwtDecode(req.user.token.accessToken);
    console.log("beforeRequestHandler: Decoded token: ", decodedJWTToken);
  } else {
    console.log("beforeRequestHandler: No token available for the request...");
  }

  next();
});

ar.start();
