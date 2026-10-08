import {describe,it,expect} from 'vitest';
import {registrationSchema} from '@/lib/registration-schema';
const valid={courseId:'11111111-1111-1111-1111-111111111111',name:'Student Example',mobile:'+919876543210',gender:'female',age:32,address:'123 Example Road, Pune',reference:''};
describe('Course registration validation',()=>{
 it('accepts a complete course registration without payment reference',()=>expect(registrationSchema.safeParse(valid).success).toBe(true));
 it.each([{name:''},{mobile:'123'},{gender:'invalid'},{age:0},{age:121},{age:1.5},{address:'x'},{courseId:'invalid'}])('rejects invalid registration details %j',change=>expect(registrationSchema.safeParse({...valid,...change}).success).toBe(false));
 it('trims personal details',()=>expect(registrationSchema.parse({...valid,name:' Student Example '}).name).toBe('Student Example'));
});
