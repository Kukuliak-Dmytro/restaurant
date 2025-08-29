import { getRestaurants } from "../services/restaurant";

export async function getRestaurantsOperation(){
    try {
        const { data, error } = await getRestaurants()
        if (error) throw error
        return data
        if(!data) throw new Error('No restaurants found')
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}