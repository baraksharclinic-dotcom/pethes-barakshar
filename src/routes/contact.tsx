import {createFileRoute} from '@tanstack/react-router';
import {pageHead} from '@/lib/academy';
import {ContactPage} from '@/components/academy/ContentPages';
export const Route=createFileRoute('/contact')({head:()=>pageHead('Contact the academy','Ask about Barakshar courses, payment approval, or your learning access.'),component:ContactPage});
