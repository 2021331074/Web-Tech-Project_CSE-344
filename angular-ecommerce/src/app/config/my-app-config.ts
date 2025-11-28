export default {
  auth: {
    domain: "dev-kvlb1sosw20vsnlz.us.auth0.com",
    clientId: "4ghF0VofgyNugfdj73JP5VS0VRIanDgW",
    authorizationParams: {
      redirect_uri: "http://localhost:4200",
      audience: "http://localhost:8080",
    },
  },
  httpInterceptor: {
    allowedList: [
      'http://localhost:8080/api/orders/**',
      'http://localhost:8080/api/checkout/purchase'
    ],
  },
}