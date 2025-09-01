import { useEffect, useState } from "react";
import currentDB, { convertDB } from "../api/currentDB";
import { CurrencyContext } from "./CurrencyContext"
import toast from "react-hot-toast";

export const CurrencyProvider = ({children}) => {

    const [currencys, setCurrencys] = useState([]);

    const [load, setLoad] = useState(true);

    useEffect(() => {

        getCurrencys();
      
    }, []);
    
    const standarizeCurrencies = (currencies = {}) => {
        if (!currencies || Object.keys(currencies).length === 0) return [];

        const currencyArray = Object.values(currencies)
            .filter((currency) => currency?.countryCode && currency.countryCode !== "Crypto" && currency.status === "AVAILABLE")
            .map((currency) => ({
                name: currency.currencyName,
                label: `${currency.currencyCode} - ${currency.currencyName}`,
                value: currency.currencyCode
            }))
            .sort((a, b) => a.name > b.name ? 1 : -1 );
        return currencyArray;
    }

    const getCurrencys = async () => {

        try {
            
            const { data } = await currentDB.get('/v2.0/supported-currencies');
    
            const tempCurrencys = standarizeCurrencies(data.supportedCurrenciesMap) ?? [];
            setCurrencys(tempCurrencys);

        } catch (error) {
            toast.error("No se pudo obtener las monedas en este momento. Por favor, inténtalo nuevamente más tarde.")
            console.log(error);            
        } finally {
            setLoad(false);
        }
    }

    const convertCurrent = async (monto, sorigen, sdestino) => {

        setLoad(true);
        try {
            const objectDate = new Date();
            const day = objectDate.getDate();
            const month = objectDate.getMonth();
            const year = objectDate.getFullYear();  
            const fullday = `${year}-${(month+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            const { data } = await convertDB.get(`convert`,{
                params:{
                    "to" : sdestino,
                    "from" : sorigen,
                    "amount" : monto,
                    "date": fullday
                }
            });

            const { result } = data;
            
            return result;            

        } catch (error) {
            toast.error("No se pudo realizar la conversión en este momento. Por favor, inténtalo nuevamente más tarde.")
            console.log(error);
        } finally {
            setLoad(false);
        }
        
    }

    return (
        <CurrencyContext.Provider value={{
            convertCurrent,
            currencys,
            load
        }}>
            {children}
        </CurrencyContext.Provider> 
    )
}