import React from 'react'
import styles from '../../styles/Categories.module.css'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function CollectionBreadCrumbs({Data, categories}:any) {
  const router = useRouter()

  const { slug, slug2, slug3, ...rest } = router.query;

  // Get all slugs from query
  const slugs = [slug, slug2, slug3, ...Object.values(rest)].filter(Boolean);

  const findCategoryName = (key: string, items?: any): string | null => {
    if (!Array.isArray(items)) return null; // Ensure items is an array

    for (const item of items) {
      if (item.url_key === key) {
        return item.name;
      }
      if (item.children) {
        const result = findCategoryName(key, item.children);
        if (result) return result;
      }
    }
    return null;
  };
  
 // Create breadcrumb array dynamically by matching slugs to category names
 const breadcrumbs = [
  { name: 'Home', path: '/' },
  ...slugs.map((slugPart: any, index) => ({
    name: findCategoryName(slugPart, categories?.data?.categories?.items) || slugPart.replace(/-/g, ' '),
    path: `/${slugs.slice(0, index + 1).join('/')}`,
  })),
];
  return (
    <>
     <div className={styles.cartegoryHeadeBreadcrumbs} style={{padding:'20px 20px 0'}}>
     {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index < breadcrumbs.length - 1 ? (
              <>
                <Link href={crumb.path}>
                  {crumb.name.replaceAll('.html','')}
                </Link>
                <span>/</span>
              </>
            ) : (
              <span style={{ fontSize: '10px', color: '#1979c3' }}>{crumb.name.replaceAll('.html','')}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
