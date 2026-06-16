import React from 'react';
import styles from '../../styles/Categories.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CategoryHeader({ Data, categories }: any) {
  const router = useRouter();
  const { slug, slug2, slug3, ...rest } = router.query;

  // Get all slugs from query
  let slugs = [slug, slug2, slug3, ...Object.values(rest)].filter(Boolean);
  
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
    <div className={styles.cartegoryHeadeBreadcrumbs}>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index < breadcrumbs.length - 1 ? (
              <>
                <Link href={crumb.path+'.html'} >
                  {crumb.name.replaceAll('.html','')}
                </Link>
                <span>/</span>
              </>
            ) : (
              <span style={{ fontSize: '10px', color: 'rgb(16 24 39)' }}>{crumb.name.replaceAll('.html','')}</span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.mainCategoryHeader}>
        <div className={styles.cartegoryHeaderContainer}>

        </div>
        <div className={styles.contentContainer}>
          <h1>{Data?.name}</h1>
          <p dangerouslySetInnerHTML={{ __html: Data?.description || null}} />
        </div>
      </div>
      
    </>
  );
}
