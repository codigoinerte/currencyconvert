import { useEffect, useRef } from 'react';
import '../assets/input.css';
import { Select } from './Select';

export const Input = ({title='', name, value, onChange, onChangeSelect }) => {

    return (
        <div>
            <div className="form-group">

                <label>{title}</label>
                <div className="money-transfer-field">
                    <input  type="number" 
                            className="form-control" 
                            autoComplete="off" 
                            name={ name }
                            value={ value } 
                            onChange={({target})=>{
                                
                                onChange({target});
                            }}
                            placeholder="100.00"/>

                    <Select name={`${name}Select`}
                            onChange={onChangeSelect} />
                </div>

            </div>        
        </div>
    )
}
