/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import styles from '../../styles/ProductDetail.module.css'
import Image from 'next/image'
import { standardizeValue } from '../../components/ConfigureProduct';


function ConfigurableProduct({ Data, handleOptionSelect, disabledOptions, activeFilters, selectedOptions }: any) {
  const attributeLabels = (key: string) => {
    return key.replaceAll('_', ' ')
  };

  return (
    <div className={styles.ConfigurableWrapper}>
      {Data?.configurable_options?.map((option: any) => (
        <div className={styles.ConfigurableSelectorWrapper} key={option.attribute_code}>
          {/* Dynamic Label based on attribute_code */}
          <label htmlFor={option.attribute_code}>
            {attributeLabels(option.attribute_code)}
          </label>

          <div className={styles.optionSelector}>
            {option.values.map((value: any, index: any) => (<>
              {option.attribute_code == 'dial_color' && value?.swatch_data?.value ? <Image
                className={
                  disabledOptions.includes(option.attribute_code + '--' + standardizeValue(value.label)) ? `${styles.disable}` : activeFilters.includes(option.attribute_code + '--' + standardizeValue(value.label)) ? `${styles.selected}` : ''
                }
                onClick={() => handleOptionSelect(option, value)}
                width={60} height={80} src={`${process.env.baseURL}media/catalog/product/` + value?.swatch_data?.value}
                alt={value.label} /> :
                <button
                  key={index}
                  value={value.label}
                  onClick={() => handleOptionSelect(option, value)}
                  style={option.attribute_code == 'metal_type' && value.swatch_data ? { color: '#000', backgroundColor: value.swatch_data.value } : {}}
                  className={
                    disabledOptions.includes(option.attribute_code + '--' + standardizeValue(value.label)) ? `${styles.disable}` : activeFilters.includes(option.attribute_code + '--' + standardizeValue(value.label)) ? `${styles.selected}` : ''
                  }

                >
                  {value.label}
                </button>}
            </>))}
          </div>

          {/* Display selected value below the buttons */}
          {selectedOptions[option.attribute_code] ?
            <p className={styles.selectedValue}>
              <b>Selected:</b> {selectedOptions[option.attribute_code]}
            </p>
            : <p className={styles.selectedValueError}>
              This is a required field
            </p>}
        </div>
      ))}

    </div>)
}

export default ConfigurableProduct


