import {z} from 'zod'


export const userSigninSchema = z.object({
    username: z.string().min(3,"username must have 3 character").max(20,"usename must have 20 character"),
    email: z.string().email(),
    phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d{10}$/, "Phone number can only contain digits"),
    password: z.string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
})

// Input validation schema
export const productUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().optional(),
  discount: z.number().int().optional(),
  discountLessValue: z.number().int().optional(),
  discount_rate: z.number().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional()
});

export const userForgetPasswordSchema = z.object({
    password: z.string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
})
export const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
})
export const userEmailSchema = z.object({
    email: z.string().email()
})
  
export type UserSigninSchema = z.infer<typeof userSigninSchema>;
export type ProductUpdateSchema = z.infer<typeof productUpdateSchema>;
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
export type UserForgetPasswordSchema = z.infer<typeof userForgetPasswordSchema>;
export type UserEmailSchema = z.infer<typeof userEmailSchema>;