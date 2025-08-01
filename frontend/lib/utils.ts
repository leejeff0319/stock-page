import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const authformSchema = (type: string) => z.object({
    firstName: type === 'log-in' ? z.string().optional(): z.string(),
    lastName: type === 'log-in' ? z.string().optional(): z.string(),
    address: type === 'log-in' ? z.string().optional(): z.string(),
    city: type === 'log-in' ? z.string().optional(): z.string(),
    state: type === 'log-in' ? z.string().optional(): z.string().min(2).max(2),
    postalCode: type === 'log-in' ? z.string().optional(): z.string().min(3).max(6),
    dob: type === 'log-in' ? z.string().optional(): z.string(),

    email: z.string().email(),
    password: z.string().min(8)
})