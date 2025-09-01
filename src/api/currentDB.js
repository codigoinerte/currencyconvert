import axios from 'axios';

const keyConvert = import.meta.env.VITE_CONVERT_DB_KEY;
const keyCurrencyFreaks =  import.meta.env.VITE_CURRENCY_FREAKS;
const currentDB = axios.create({
    baseURL : 'https://api.currencyfreaks.com/',  
    params:{
        apikey: keyCurrencyFreaks
    }  
});

export const convertDB = axios.create({
    baseURL:'https://api.apilayer.com/exchangerates_data/',
    params: {
        apikey : keyConvert
    }
})

export default currentDB;