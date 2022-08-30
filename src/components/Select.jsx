import React, { useContext, useRef } from "react";

import { SelectPicker } from 'rsuite';

import '../assets/select.css';
import { CurrencyContext } from "../context/CurrencyContext";

export const Select = React.memo(({onChange, name}) => {
        
    const { currencys } = useContext(CurrencyContext);

    return (
        <div className="amount-currency-select">
            <SelectPicker   data={currencys}    
                            name={name}
                            onChange={(e)=>{
                                onChange({
                                    target:{
                                        name,
                                        value:e
                                    }
                                });                                
                            }}
            />
        </div>
    )
})
