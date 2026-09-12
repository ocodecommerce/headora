import React, { useEffect, useState } from 'react';
import styles from '../../styles/ProductDetail.module.css';
import Image from 'next/image';
import {
  standardizeValue,
} from '../ConfigureProduct';

function AttributeSlider({ option, handleOptionSelect, disabledOptions, activeFilters }: any) {
  const [translateX, setTranslateX] = useState(0);
  const [currectIndex, setCurrentIndex] = useState(0);
  const [maxtranslateX, setMaxTranslateX] = useState(0);
  const [visibleItems, setVisibleItems] = useState(100);
  const [selectedValue, setSelectedValue] = useState<string | null>("none"); // State for active filter

  const itemsToShow = 4; // Number of items to show in the slider

  useEffect(() => {
    if (['ring_size', 'total_carat_weight', 'bracelet_size'].includes(option.attribute_code)) {
      setVisibleItems(maxtranslateX / 65);
    } else if (option.attribute_code === 'dial_color') {
      setVisibleItems(maxtranslateX / 80);
    } else {
      setVisibleItems(maxtranslateX / 170);
    }
  }, [option, maxtranslateX]);

  const onResize = () => {
    if (window.innerWidth > 1000) {
      setMaxTranslateX((window.innerWidth * 39) / 100);
    } else {
      setMaxTranslateX((window.innerWidth * 100) / 100);
    }
  };

  useEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const attributeLabels = (key: string) => {
    return key.replaceAll('_', ' ');
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < option.values.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handleOptionClick = (option: any, value: any) => {
    handleOptionSelect(option, value);
    setSelectedValue(value.label); // Set the selected value for active filter
  };

  return (
    <div id={option.attribute_code} className={styles.ConfigurableSelectorWrapper} key={option.attribute_code}>
      <label htmlFor={option.attribute_code}>{attributeLabels(option.attribute_code)}</label>
      <div className={styles.optionSelector}>
        {currectIndex > 0 && <p className="SwiperNavigation Prev" onClick={handlePrev}></p>}
        <div className="sliderContainer">
          <div
            className={'sliderContainerInner ' + option.attribute_code}
            style={{ transform: `translateX(-${translateX}px)` }}
          >
            {option.values.slice(currectIndex, option.values.length).map((value: any, index: any) => (
              <>
                {option.attribute_code === 'dial_color' && value.swatch_data ? (
                  <Image
                    className={
                      activeFilters.includes(option.attribute_code + '--' + standardizeValue(value.label))
                        ? `${styles.selected}`
                        : ''
                    }
                    onClick={() => handleOptionClick(option, value)}
                    width={60}
                    height={80}
                    src={`${process.env.baseURL}media/catalog/product/` + value?.swatch_data?.value}
                    alt={value.label}
                  />
                ) : (
                  <p
                    key={index}
                    onClick={() => handleOptionClick(option, value)}
                    style={
                      option.attribute_code === 'metal_type' ||
                      (option.attribute_code === 'fashion_color' && value.swatch_data)
                        ? { color: '#000', backgroundColor: value.swatch_data?.value }
                        : {}
                    }
                    className={
                      disabledOptions.includes(option.attribute_code + '--' + standardizeValue(value.label))
                        ? `disable`
                        : activeFilters.includes(option.attribute_code + '--' + standardizeValue(value.label))
                        ? `selected`
                        : ''
                    }
                  >
                    {option.attribute_code === 'fashion_color' ? (
                      <>
                        {activeFilters.includes(option.attribute_code + '--' + standardizeValue(value.label)) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon-icon-Dp3"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </>
                    ) : (
                      value.label
                    )}
                  </p>
                )}
              </>
            ))}
          </div>
        </div>
        {option.values.slice(currectIndex, option.values.length).length > visibleItems && (
          <p className="SwiperNavigation Next" onClick={handleNext}></p>
        )}
      </div>

      {/* Display Selected Attribute Label and Value */}
      {/* {selectedValue && ( */}
        <div className={styles.selectedFilter}>
          <p>
            Selected {attributeLabels(option.attribute_code)}:  {selectedValue}
          </p>
        </div>
      {/* )} */}
    </div>
  );
}

export default AttributeSlider;
