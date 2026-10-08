import { createFileRoute } from '@tanstack/react-router';
import {catalogOptions,pageHead} from '@/lib/academy';
import {ContentPage} from '@/components/academy/ContentPages';
import {RouteError,RouteMissing} from '@/components/academy/shared';
export const Route=createFileRoute('/faq')({head:()=>pageHead('Faq','Search answers about courses, enrollment, payments and learning access.'),loader:({context})=>context.queryClient.ensureQueryData(catalogOptions),component:()=> <ContentPage kind="faq"/>,errorComponent:RouteError,notFoundComponent:RouteMissing});
