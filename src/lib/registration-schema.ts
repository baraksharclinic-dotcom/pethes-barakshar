import { z } from 'zod';
export const registrationSchema = z.object({
 courseId:z.string().uuid(),
 name:z.string().trim().min(2,'Enter your full name.').max(120),
 mobile:z.string().trim().regex(/^\+?[0-9]{10,15}$/,'Enter 10–15 digits, optionally starting with +.'),
 gender:z.enum(['female','male','other','prefer_not_to_say']),
 age:z.number().int().min(1,'Enter a valid age.').max(120),
 address:z.string().trim().min(5,'Enter your complete address.').max(1000),
 reference:z.string().trim().max(200).default(''),
});
