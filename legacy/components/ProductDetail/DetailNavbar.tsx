import React, { useState } from 'react';
import ProductDetailDiscription from './ProductDetailDiscription';


function DetailNavbar({currentVariant, Data}:any) {
 


  return (
    <>
      
           
        <ProductDetailDiscription currentVariant={currentVariant} Data={Data}/>
         
    </>
  );
}

export default DetailNavbar;
