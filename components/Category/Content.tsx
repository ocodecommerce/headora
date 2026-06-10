import React, { useState } from 'react';
import styles from '../../styles/Categories.module.css';

interface ContentProps {
  description: string | null | undefined;
}

export default function Content({ description }: ContentProps) {
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Count words safely
  const countWords = (text: string | null | undefined): number => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return 0;
    }
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Truncate text to specified word limit
  const truncateText = (text: string | null | undefined, wordLimit: number): string => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return '';
    }

    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return text;
    }

    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const wordLimit = 130;
  const wordCount = countWords(description);
  const isLongDescription = wordCount > wordLimit;
  
  const displayText = isExpanded 
    ? description 
    : truncateText(description, wordLimit);

  // Don't render anything if there's no description
  if (!description || description.trim() === '') {
    return null;
  }

  return (
    <div className={styles.descriptionContainer}>
      <div id='Bottom-description-1'  
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: displayText || '' }}
      />
      
      {isLongDescription && (
        <span
          className={styles.showToggle}
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </span>
      )}
    </div>
  );
}