import { getRestaurants,getRestaurantById, createRestaurant, updateRestaurant } from "../services/restaurant";
import type Restaurant from "../types/restaurant";
export async function getRestaurantsOperation(){
    
        const { data, error } = await getRestaurants()
        if (error) throw error
        return data
   
}
export async function getRestaurantByIdOperation(id: number){
        const { data, error } = await getRestaurantById(id)
        if (error) throw error
        return data
}
export async function createRestaurantOperation(restaurant: Partial<Restaurant>){
        const { data, error } = await createRestaurant(restaurant)
        if (error) throw error
        console.log(data)
        return data
}
export async function updateRestaurantOperation(id: number, restaurant: Partial<Restaurant>){
        const { data, error } = await updateRestaurant(id, restaurant)
        if (error) throw error
        return data
}   