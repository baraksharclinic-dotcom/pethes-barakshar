import { queryOptions } from '@tanstack/react-query';
import { getCatalog } from './academy.functions';
export const catalogOptions=queryOptions({queryKey:['catalog'],queryFn:()=>getCatalog(),staleTime:60000});
export const pageHead=(title:string,description:string)=>({meta:[{title:`${title} — Pethe's Barakshar`},{name:'description',content:description},{property:'og:title',content:`${title} — Pethe's Barakshar`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]});
export const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
export const dateIST=(s:string)=>new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(new Date(s));
