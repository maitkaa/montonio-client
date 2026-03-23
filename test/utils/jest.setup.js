// Patch axios.create to disable proxy in tests.
// In this environment, a system proxy routes all traffic before nock can intercept it.
// Disabling the proxy at the axios level ensures nock interceptors work correctly.
const axios = require("axios");
const originalCreate = axios.default ? axios.default.create.bind(axios.default) : axios.create.bind(axios);
const axiosInstance = axios.default || axios;
axiosInstance.create = function(config) {
    return originalCreate({ proxy: false, ...config });
};
