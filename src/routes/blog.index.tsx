import { createFileRoute } from '@tanstack/react-router';
import {catalogOptions,pageHead} from '@/lib/academy';
import {ContentPage} from '@/components/academy/ContentPages';
import {RouteError,RouteMissing} from '@/components/academy/shared';
export const Route=createFileRoute('/blog/')({head:()=>pageHead('Blog','Educational articles and perspectives from the Barakshar academy.'),loader:({context})=>context.queryClient.ensureQueryData(catalogOptions),component:()=> <ContentPage kind="blog"/>,errorComponent:RouteError,notFoundComponent:RouteMissing});
