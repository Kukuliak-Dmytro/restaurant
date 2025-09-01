export type Pagination<T> = {
    page: number
    limit: number
    data:T[]
    total: number
}

export function paginate<T>(data: T[], page: number, limit: number): Pagination<T> {
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedData = data.slice(start, end)
  
    return {
        page,
        limit,
        total: data.length,
        data: paginatedData
    }
}