import supabaseClient from "../utils/supabase";
import Restaurant from "../types/restaurant";

export async function getRestaurants(): Promise<{data: Restaurant[], error: any}> {
    const { data, error } = await supabaseClient.from('restautant_locations').select('*')
    if (error) throw error
    return {data, error}
}