import { createFileRoute } from '@tanstack/react-router';
import {catalogOptions,pageHead} from '@/lib/academy';
import {ContentPage} from '@/components/academy/ContentPages';
import {RouteError,RouteMissing} from '@/components/academy/shared';
export const Route=createFileRoute('/knowledge/')({head:()=>pageHead('Knowledge','Tissue salt reference articles and Biochemic study resources.'),loader:({context})=>context.queryClient.ensureQueryData(catalogOptions),component:()=> <ContentPage kind="knowledge"/>,errorComponent:RouteError,notFoundComponent:RouteMissing});
