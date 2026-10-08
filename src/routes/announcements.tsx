import { createFileRoute } from '@tanstack/react-router';
import {catalogOptions,pageHead} from '@/lib/academy';
import {ContentPage} from '@/components/academy/ContentPages';
import {RouteError,RouteMissing} from '@/components/academy/shared';
export const Route=createFileRoute('/announcements')({head:()=>pageHead('Announcements','Academy batch updates, upcoming workshops and announcements.'),loader:({context})=>context.queryClient.ensureQueryData(catalogOptions),component:()=> <ContentPage kind="announcements"/>,errorComponent:RouteError,notFoundComponent:RouteMissing});
