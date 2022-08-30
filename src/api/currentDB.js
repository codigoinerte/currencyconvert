import axios from 'axios';

const keyConvert = import.meta.env.VITE_CONVERT_DB_KEY;

const currentDB = axios.create({
    baseURL : 'https://api.currencyfreaks.com/',    
});

export const convertDB = axios.create({
    baseURL:'https://api.apilayer.com/currency_data/',
    params: {
        apikey : keyConvert
    }
})

export default currentDB;