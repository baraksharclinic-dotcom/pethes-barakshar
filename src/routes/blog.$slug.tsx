import {createFileRoute} from '@tanstack/react-router';
import {catalogOptions,pageHead} from '@/lib/academy';
import {ArticlePage} from '@/components/academy/ContentPages';
import {RouteError,RouteMissing} from '@/components/academy/shared';
export const Route=createFileRoute('/blog/$slug')({head:({params})=>pageHead(params.slug.replace(/-/g,' '),'Educational articles and perspectives from the Barakshar academy.'),loader:({context})=>context.queryClient.ensureQueryData(catalogOptions),component:Detail,errorComponent:RouteError,notFoundComponent:RouteMissing});
function Detail(){const {slug}=Route.useParams();return <ArticlePage kind="blog" slug={slug}/>}
