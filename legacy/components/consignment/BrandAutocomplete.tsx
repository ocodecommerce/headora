import React, { useState, useEffect, useRef } from 'react';
import styles from "../../styles/Consignment.module.css";
const BrandAutocomplete:any = ({wrapperRef,value,handleChange,showSuggestions,filteredBrands,handleSuggestionClick}:any) => {




  return (
    <div ref={wrapperRef} className={styles.autoFillerContainer} >
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type a brand name..."
        style={{ width: '100%', padding: '8px' }}
      />
      {showSuggestions && filteredBrands.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {filteredBrands.map((brand:any, idx:any) => (
            <li
              key={idx}
              onClick={() => handleSuggestionClick(brand)}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {brand}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrandAutocomplete;
