import React, { useState, useEffect } from 'react';
import styles from '../../styles/CollectionPage.module.css';
import Link from 'next/link';
import Image from 'next/image';

function CollectionContent({ BlogContent }: any) {
  const [randomBlogs, setRandomBlogs] = useState<any[]>([]);

  useEffect(() => {
    if (BlogContent?.posts?.edges?.length > 0) {
      // Shuffle the blogs and pick 3 random ones
      const shuffledBlogs = [...BlogContent.posts.edges].sort(() => 0.5 - Math.random());
      const filteredBlogs = shuffledBlogs.filter(blog => {
        const sourceUrl = blog?.node?.featuredImage?.node?.sourceUrl;
        return sourceUrl && sourceUrl.trim() !== ''; // Only include blogs with valid image URLs
      });
      setRandomBlogs(filteredBlogs.slice(0, 3));
    }
  }, [BlogContent?.posts?.edges]);

  // Function to truncate the excerpt
  function truncateExcerpt(htmlString: string, wordLimit: number) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    const text = div.textContent || div.innerText || '';
    const words = text.split(' ').slice(0, wordLimit).join(' ');
    return words;
  }

  if (!randomBlogs || randomBlogs.length === 0) {
    return null;
  }

  return (
    <div className={styles.relatedProductsContainer}>
      <h3 className={styles.title}>From The Verse</h3>
      <div className={styles.blogRow}>
        {randomBlogs.map((blog: any) => (
          <div
            key={blog?.node?.id}
            className={styles.BlogproductItem}
            onClick={() => {
              window.open(`${process.env.baseURLWithoutTrailingSlash}/guide/${blog?.node?.slug}`, "_blank");
            }}
          >
            <Image
              src={
                blog?.node?.featuredImage?.node?.sourceUrl?.includes("cache")
                  ? blog?.node?.featuredImage?.node?.sourceUrl?.replace(/\/cache\/.*?\//, "/")
                  : blog?.node?.featuredImage?.node?.sourceUrl
              }
              width={500}
              height={500}
              alt={blog?.node?.title || "Blog Image"}
              className={styles.BlogProductImage}
            />
            <h4>{blog?.node?.title}</h4>
            <p
              className={styles.contentName}
              dangerouslySetInnerHTML={{
                __html: truncateExcerpt(blog.node.excerpt, 30) + '...',
              }}
            ></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollectionContent;
