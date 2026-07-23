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
         <div className={styles.freeSpace}></div>
         <nav
  className={styles.cartegoryHeadeBreadcrumbs}
  aria-label="Breadcrumb"
  style={{ padding: "20px 20px 0" }}
>
  <ol className={styles.breadcrumbList}>
    {breadcrumbs.map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      const label = crumb.name.replaceAll(".html", "");

      return (
        <li
          key={index}
          className={isLast ? styles.ProductDisplayName : undefined}
          aria-current={isLast ? "page" : undefined}
        >
          {isLast ? (
            <span>{label}</span>
          ) : (
            <Link href={crumb.path} title={label}>
              {label}
            </Link>
          )}
        </li>
      );
    })}
  </ol>
</nav>
    </>
  )
}
