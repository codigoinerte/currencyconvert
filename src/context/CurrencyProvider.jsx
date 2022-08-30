import { useEffect, useState } from "react";
import currentDB, { convertDB } from "../api/currentDB";
import { CurrencyContext } from "./CurrencyContext"

export const CurrencyProvider = ({children}) => {

    const [currencys, setCurrencys] = useState([]);

    const [load, setLoad] = useState(true);

    useEffect(() => {

        getCurrencys();
      
    }, []);
    
    const getCurrencys = async () => {

        try {
            
            const { data } = await currentDB.get('currency-symbols');
    
            const tempCurrencys = Object.keys(data).map(
                item => ({ label: item, value: item })
            );
    
            setCurrencys(tempCurrencys); 
    
            setLoad(false);

        } catch (error) {
            console.log(error);
        }        
    }

    const convertCurrent = async (monto, sorigen, sdestino) => {

        setLoad(true);
        try {
            
            const { data } = await convertDB.get(`convert?to=${sdestino}&from=${sorigen}&amount=${monto}`);

            setLoad(false);
            
            const { result } = data;

            
            return result;
            
            

        } catch (error) {
            
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