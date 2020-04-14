import axios from 'axios';
import {key, proxy} from '../config';

export default class Search{
    constructor(query){
        this.query = query;
    }
    async getResult(){

        try {
            const res = await axios(`${proxy}http://recipesapi.herokuapp.com/api/search?${key}&q=${this.query}`);
            this.result = res.data.recipes; 
            // console.log(this.result);
            
        } catch (error) {
            alert(error);
        }
        
       
    }
}
