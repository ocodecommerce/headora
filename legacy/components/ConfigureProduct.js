import { exit } from "process";
const cleanString = function (input) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) <= 127) {
        output += input.charAt(i);
        }
    }
    return output;
    };

const standardizeValue = function (val) {
    if (val === null) {
      val = '';
    }
    try {
      let replacement = '_';
      const fractionMap = {
        '¼': '1_4',
        '½': '1_2',
        '¾': '3_4',
        '⅐': '1_7',
        '⅑': '1_9',
        '⅒': '1_10',
        '⅓': '1_3',
        '⅔': '2_3',
        '⅕': '1_5',
        '⅖': '2_5',
        '⅗': '3_5',
        '⅘': '4_5',
        '⅙': '1_6',
        '⅚': '5_6',
        '⅛': '1_8',
        '⅜': '3_8',
        '⅝': '5_8',
        '⅞': '7_8',
      };
      for (const fract in fractionMap) {
        const re = new RegExp(fract, 'g');
        
        val = val.replace(re, fractionMap[fract]);
      }
      val = val.toLowerCase().trim();
      val = cleanString(val);
      val = val.replace(/\\/g, replacement);
      val = val.replace(/\//g, replacement);
      val = val.replace(/:/g, '');
      val = val.replace(/\,/g, '');
      val = val.replace(/\'/g, '');
      val = val.replace(/\&/g, '');
      val = val.replace(/\%/g, '');
      val = val.replace(/\$/g, '');
      val = val.replace(/\s/g, replacement);
      val = val.replace(/-/g, replacement);
      val = val.replace(/_/g, replacement);
      val = val.replace(/\./g, replacement);
    } catch (err) {
      
      return '';
    }
  
    return val;
  };


const createFiltersFromAggregations=(aggregations, { filterableCategories = [], filterableCategoriesHidden = [], ignoreFilters = [] } = {}) =>{

    let filtersVisuallyHidden = {
        
    };

    const filters = {};
    const filtersCount = {};
    const optionValueMap = {};
    const filterDefs = { 'filter_metal': { 'type': 'single' }, 'filter_stone_type': { 'type': 'single' } };
    ignoreFilters = ignoreFilters.concat([
        'category_id'
    ]);

    aggregations.forEach((ag) => {
        //the magento 2.4.5 upgrade switches category_id to category_uid
        if (ag.attribute_code == 'category_uid') {
            ag.attribute_code = 'category_id';
        }
        const ac = ag.attribute_code
        if (ignoreFilters.indexOf(ac) != -1) {
            return;
        }
        const type = filterDefs[ac]?.type ?? 'multiple'
        filters[ac] = {
            label: ag.label,
            options: {},
            type: type,
            active: []
        }

        //note ag.count is the number of options not the product count
        //bc magento 2 sucks
        filtersCount[ac] = 0;

        ag.options.forEach((opt, indx, arr) => {
            let skip = false;
            if (ac == 'category_id') {
                if (filterableCategories.indexOf(opt.value.toString()) == -1) {
                    skip = true;
                    delete arr[indx];
                } else if (filterableCategoriesHidden.indexOf(opt.value.toString()) != -1) {
                    if (typeof filtersVisuallyHidden['category_id'] == 'undefined') {
                        filtersVisuallyHidden['category_id'] = {
                            options: {}
                        }
                    }
                    const labelStandardized = standardizeValue(opt.label);
                    filtersVisuallyHidden['category_id'].options[labelStandardized] = opt.label;
                }
            }
            if (!skip) {
                const labelStandardized = standardizeValue(opt.label);
                filters[ac].options[labelStandardized] = opt.label;
                optionValueMap[opt.value] = {
                    label: opt.label,
                    labelStandardized
                };
                const filterKey = `${ac}--${labelStandardized}`
                filtersCount[filterKey] = 0;
            }
        });
        ag.options = ag.options.filter((n) => n);
    });

    return { filters, optionValueMap}
   
}


const modifyActiveFiltersFromConfiguration = function (product, allActiveFilters = []) {
    
    if (product && typeof product.configurableOptions != 'undefined' && product.configurableOptions.length > 0) {
        
        product.configurableOptions.forEach((option) => {
            let prefixes = [];
            prefixes.push(`${option.attribute_code}--`);
            
            if (typeof altAttCodes != 'undefined' && typeof altAttCodes[option.attribute_code] != 'undefined') {
                
                prefixes.push(`${altAttCodes[option.attribute_code]}--`);
            }
            if (
                !allActiveFilters.some((tag) => {
                    let match = false;
                    prefixes.forEach((prefix) => {
                        if (tag.indexOf(prefix) != -1) {
                            match = true;
                        }
                    })
                    return match;
                })
            ) {
                let match = false;
                if (typeof product.defaultSelections != 'undefined' && typeof product.defaultSelections[option.attribute_code] != 'undefined') {
                    
                    product.defaultSelections[option.attribute_code].forEach((val) => {
                        if (!match) {
                            const tag = `${option.attribute_code}--${val}`;
                            
                            option.values.forEach((val) => {
                                if (!match) {
                                    if (val.tags.indexOf(tag) != -1) {
                                        match = true;
                                        allActiveFilters = allActiveFilters.concat(val.tags);
                                    }
                                }
                            });
                        }
                    });
                }
                
            }
        });
    }
    return allActiveFilters;
}

const createProductsFromMagProducts =  function (magentoProducts = [], filters = {}, optionValueMap = {}) {
    let products = [];
       magentoProducts.forEach(async(p, i, arr) => {
        let tags = []
        
        if (typeof filters != 'undefined' && filters) {
            for (const filter in filters) {
                let productFilterValues = [];
                if (filter == 'category_id') {
                    if (
                        typeof p.categories != 'undefined' &&
                        p.categories != null &&
                        p.categories.length > 0
                    ) {
                        p.categories.forEach((c) => {
                            const cString = c.id.toString();
                            //only keepable categories have a value in the value map
                            if (typeof optionValueMap[cString] != 'undefined') {
                                productFilterValues.push(cString);
                            }
                        })
                    }

                } else if (typeof p[filter] != 'undefined' && p[filter] != null) {
                    if (Array.isArray(p[filter])) {
                        //could be like [ '3643, Nexus Diamond Alternative', '3644, Moissanite' ]
                        p[filter].forEach((opt) => {
                            let split = opt.split(',').map(v => v.trim())
                            if (split.length > 1) {
                                productFilterValues.push(split[1]);
                            } else {
                                if (split[0].length > 0) {
                                    productFilterValues.push(split[0]);
                                }
                            }
                        });
                    } else {
                        productFilterValues.push(p[filter])
                    }
                };

                
                productFilterValues.forEach((v) => {
                    if (typeof optionValueMap[v] != 'undefined') {
                        const filterKey = `${filter}--${optionValueMap[v].labelStandardized}`;
                        tags.push(filterKey);
                    } else if (typeof v != 'undefined' && v.length > 0) {
                        //if it's not a value and just a string
                        const filterKey = `${filter}--${standardizeValue(v)}`;
                        tags.push(filterKey);
                    }
                })
            }
        }


        let videos = p.video_pdp_page?p.video_pdp_page.split(','):[]
        let newVideos =[]
         videos.forEach(video=>{
            newVideos.push({url:video,thumbnail:''})
         })
        
       
        let variants = [];
        if (typeof p.variants != 'undefined' && p.variants) {
            for (let i = 0; i < p.variants.length; i++) {
                let v = p.variants[i];
                let indx = i;
                let tags = [];
                if (typeof v.attributes != 'undefined') {
                    
                    v.attributes.forEach((att) => {
                        tags.push(`${att.code}--${standardizeValue(att.label)}`)
                        if (typeof altAttCodes != 'undefined' && typeof altAttCodes[att.code] != 'undefined') {
                            tags.push(`${altAttCodes[att.code]}--${standardizeValue(att.label)}`)
                        }
                    })
                }

               
                if (typeof v.quantity != 'undefined' && v.quantity) {
                    tags.push(`quantity--${v.quantity}`);
                }
                let varentVideos =[]
                let videos = v.product.video_pdp_page?v.product.video_pdp_page.split(','):[]
                 videos.forEach(video=>{
                            varentVideos.push({url:video,thumbnail:''})
                 })
                 variants[indx] = v.product
                 variants[indx]['tags']=tags
                 variants[indx]['originalIndex']=indx
                 variants[indx]['description']=v.product.description?v.product.description.html:''
                 variants[indx]['short_description']=v.product.short_description?v.product.short_description.html:''
                 variants[indx]['variant_name']=v.product.name
                 variants[indx]['priceRange']=v.product.price_range,
                 variants[indx]['videos']=varentVideos
                 variants[indx]['attributes']=v.attributes

                // variants[indx] ={
                //     originalIndex: indx,
                //     tags,
                //     id: v.product.id,
                //     image:v.product.image,
                //     media_gallery:v.product.media_gallery,
                //     video_pdp_page:v.product.video_pdp_page,
                //     sku: v.product.sku,
                //     description:v.product.description?v.product.description.html:'',
                //     short_description:v.product.short_description?v.product.short_description.html:'',
                //     variant_name:v.product.name,
                //     priceRange: v.product.price_range,
                //     meta_title: v.product.meta_title,
                //     meta_keyword: v.product.meta_keyword,
                //     meta_description : v.product.meta_description,
                //     videos: varentVideos,
                //     attributes:v.attributes
      
                    
                // }
                
            }
        }
        products[i] = p
        products[i]['short_description']=p.short_description?p.short_description.html:'',
        products[i]['tags']=tags
        products[i]['variants']=variants
        products[i]['selectedVariant']= null
        products[i]['position']= i
        products[i]['videos']= newVideos
        products[i]['priceRange']= p.price_range

     
    })
    
    return products 
}
 
async function getVideos(product){
    let videos = product.video_pdp_page?product.video_pdp_page.split(','):['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4']
    let newVideos =[]
      videos.forEach(async(video)=>{
        let videoItem=[]
        videoItem['thumbnail'] = ''
        videoItem['url'] = video
        newVideos.push(videoItem)
      })
      return newVideos
}

const getPrice = function (product, allActiveFilters) {
    let variants = product.variants ?? null;
    let defaultPriceRange = product.defaultPriceRange
    if (
        allActiveFilters.length == 0 ||
        typeof variants == 'undefined' ||
        !variants ||
        variants.length == 0
    ) {
        return {
            priceRange: defaultPriceRange,
            variantIndex: null
        }
    }
    let filterStr = allActiveFilters.join('&');
    
    if (typeof product.prefiltered == 'undefined') {
        product.prefiltered = {}
    }
    if (typeof product.prefiltered[filterStr] == 'undefined') {
        let copyV = [...variants].sort((a, b) => {
            let matches = {
                a: 0,
                b: 0
            }
            if (!Array.isArray(a.tags)) {
                a.tags = [];
            }
            if (!Array.isArray(b.tags)) {
                b.tags = [];
            }
            [a.tags, b.tags].forEach((viewTags, indx) => {
                let x = 'a';
                if (indx == 1) {
                    x = 'b';
                }
                allActiveFilters.forEach((tag) => {
                    if (viewTags.indexOf(tag) != -1) {
                        matches[x] += 2;
                    }
                })
            });
           
            return matches.b - matches.a;
        });
        product.prefiltered[filterStr] = {
            price_range: copyV[0].price_range,
            variantIndex: copyV[0].originalIndex
        }
    }

    return {
        priceRange: product.prefiltered[filterStr].price_range,
        variantIndex: product.prefiltered[filterStr].variantIndex
    };
}

const updateProduct = function (product={}, allActiveFilters = [], isPdp = false) {
    if(product){
    //this px value is added to trigger changes in products on paging
    //but can build up a lot of data with paging, so remove here
    let px = allActiveFilters.filter((f) => {
        return f.indexOf('px--') != -1;
    });
    if (px.length > 1) {
        allActiveFilters = allActiveFilters.filter((f) => {
            return f.indexOf('px--') == -1;
        });
    }
    //modify active filters based on configuration
    allActiveFilters = modifyActiveFiltersFromConfiguration(product, allActiveFilters);
    let { priceRange, variantIndex } = getPrice(product, allActiveFilters);
    product.price_range = priceRange;
    product.selectedVariant = variantIndex;
    
    return variantIndex
    }
}

const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // Setting the expiration for the cookie
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    const cookieArr = document.cookie.split("; ");
    for (let cookie of cookieArr) {
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  };


  const validateConfigurations = function (product, allActiveFilters) {
    let matchFound = false
    let variants = product?.variants ?? null;
    
       
            variants?.forEach((variant, indx) => {
                let viewTags= variant.tags
                let included = allActiveFilters.every(i => viewTags.includes(i))
                
                 if(included){
                    matchFound =  true
                    return matchFound
                }

            });
       
         return matchFound
   
    
}

 const strToArray=(string,sperator)=>{
return string.split(sperator)
 }

 const getFormattedCurrency=(price)=>{
    return '$'+new Intl.NumberFormat().format(parseInt(price))
}

const getFilePath=(filePath)=>{
    return filePath?filePath.replace(/\/cache\/.*?\//, "/"):filePath
}


const isFunction = function (functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  };

async function affirmUpdate(price) {
    let affirm_show = true;
    if (price < 100) {
        affirm_show = false;
    }
    try {
        if (typeof affirm != 'undefined' && affirm.ui != undefined && isFunction(affirm.ui.refresh)) {
            //Call affirm.ui.refresh to re-render componenets
            affirm.ui.refresh();
        }
    } catch (err) {
  
    }
    return affirm_show;
}

function processAffirmPrice(price) {
    price = (Math.round(price * 100) / 100).toFixed(2)
    price = price.replace('.', '')
    return price;
}


export {affirmUpdate,processAffirmPrice,getFilePath,getFormattedCurrency,strToArray,validateConfigurations,setCookie, getCookie, updateProduct ,createFiltersFromAggregations,createProductsFromMagProducts,standardizeValue}