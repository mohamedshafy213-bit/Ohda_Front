// // axios
// import axios from 'axios'

// const baseURL = ''

// export default axios.create({
//   baseURL,
//   // You can add your headers here
// })
////////////////////////////////////////////////////////////////////////////
// axios
import axios from "axios";
// import {useRouter} from 'vue-router'
// Use main API root; falls back to same root used by fetchApi (VITE_ROOT_URL)
const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_ROOT_URL || "";
const api = axios.create({
    baseURL,
    // You can add your headers here
});

api.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        if (response.status === 200) {
            console.log("Success:", response);
        }
        return response;
    },
    (error) => {
        // const router = useRouter()
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response) {
            switch (error.response.status) {
                case 500:
                    console.error("Error 500: Server error", error.response);
                    // location.replace('/archive/login')
                    // Handle unauthorized access, e.g., redirect to login, refresh token, etc.
                    break;
                // case 400:
                //   console.error('Error 400:  Error', error.response);
                //   location.replace('/archive/login')
                //   // Handle resource not found
                //   break;
                case 401:
                    console.error("Error 401: Unauthorized", error.response);
                    // Do not execute hard location.replace which wipes SPA state.
                    // The router guard and user store manage auth redirection cleanly.
                    break;
                case 404:
                    console.error("Error 404:  Not Found", error.response);
                    //  location.replace('/archive/login')
                    // Handle resource not found
                    break;

                default:
                    console.error("Unhandled error", error.response);
            }
        } else {
            console.error("Network/Error", error);
        }
        return Promise.reject(error);
    }
);

export default api;
