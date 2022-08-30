import { useContext } from 'react';

import Swal from 'sweetalert2'

import { CurrencyContext } from '../context/CurrencyContext';
import { Input, Loader, Separate } from '../components';
import { useForm } from '../hooks';

import 'rsuite/dist/rsuite.min.css';
import '../assets/global.css';

export const HomeScreen = () => {

    const { load, convertCurrent } = useContext(CurrencyContext);
    
    const { first, second, firstSelect, secondSelect, onInputChange} = useForm({
        first: 0,
        second:0,
        firstSelect:'',
        secondSelect:''
    })

    const onSubmit = async (e) => {
        e.preventDefault();

        if(firstSelect == ''){
            Swal.fire({
                title: 'Error!',
                text: 'Select first currency',
                icon: 'error',
                confirmButtonText: 'Close'
            });

            return false;
        }
        
        if(secondSelect == ''){
            Swal.fire({
                title: 'Error!',
                text: 'Select second currency',
                icon: 'error',
                confirmButtonText: 'Close'
            });

            return false;
        }

        if(first == 0 && second == 0){

            Swal.fire({
                title: 'Error!',
                text: 'Insert an amount',
                icon: 'error',
                confirmButtonText: 'Close'
            });

            return false;
        }
        

        const monto = first == 0 ? second : first;

        const result = await convertCurrent(monto, firstSelect, secondSelect);

        const target = {
            name: first == 0 ? "first" : "second" ,
            value: result
        }
        onInputChange({target});
    }



    return (
        <>
            {
                load && <Loader />
            }
            <div className='main'>
                <h1 className='title'>Currency convert</h1>

                <form onSubmit={onSubmit}>
                    <Input title='First current' value={first} name="first" onChange={onInputChange} onChangeSelect={onInputChange} />
                    
                    <Separate />
                    
                    <Input title='Second current' value={second} name="second" onChange={onInputChange} onChangeSelect={onInputChange} />

                    <div className="text-center">
                        <button type="submit" className="btn btn-primary">Convert</button>
                    </div>
                </form>   

            </div>
        </>
    )
}
