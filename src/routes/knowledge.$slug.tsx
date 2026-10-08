import {createFileRoute} from '@tanstack/react-router';
import {catalogOptions,pageHead} from '@/lib/academy';
import {ArticlePage} from '@/components/academy/ContentPages';
import {RouteError,RouteMissing} from '@/components/academy/shared';
export const Route=createFileRoute('/knowledge/$slug')({head:({params})=>pageHead(params.slug.replace(/-/g,' '),'Tissue salt reference articles and Biochemic study resources.'),loader:({context})=>context.queryClient.ensureQueryData(catalogOptions),component:Detail,errorComponent:RouteError,notFoundComponent:RouteMissing});
function Detail(){const {slug}=Route.useParams();return <ArticlePage kind="knowledge" slug={slug}/>}
