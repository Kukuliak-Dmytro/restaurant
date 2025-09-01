import { fireEmployee, updateEmployee, createEmployee, getEmployees, getEmployeeById     } from "../services/employee";
import type Employee from "../types/employee";

export async function getEmployeesOperation() {
    const { data, error } = await getEmployees()
    if (error) throw error
    return data
}

export async function getEmployeeByIdOperation(id: number) {
    const { data, error } = await getEmployeeById(id)
    if (error) throw error
    return data
}

export async function createEmployeeOperation(employee: Partial<Employee>) {
    const { data, error } = await createEmployee(employee)
    if (error) throw error
    return data
}

export async function updateEmployeeOperation(id: number, employee: Partial<Employee>) {
    const { data, error } = await updateEmployee(id, employee)
    if (error) throw error
    return data
}

export async function fireEmployeeOperation(id: number) {
    const { data, error } = await fireEmployee(id)
    if (error) throw error
    return data
}