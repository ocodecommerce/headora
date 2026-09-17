import React from "react";
import styles from "../../styles/Consignment.module.css";



const ItemList:any = ({ items, setItems, setCurrentStep }:any) => {
  if (items.length === 0) {
    return null;
  }
  // Handle deleting an item
  const deleteItem = (index: number) => {
    setItems(items.filter((_:any, i: number) => i !== index));
    setCurrentStep(1)
  };
  return (
   
      <div className={styles.itemList}>
        <p>Item(s) You Are Consigning:</p>
        <hr />
        {items.map((item:any, index:any) => (
          <div key={index} className={styles.item}>
            {`${index + 1}. ${item.type}, ${item.brand || "N/A"}, $${item.value}`}
            <button
              type="button"
              onClick={() => deleteItem(index)}
              className={styles.deleteBtn}
            >
              DELETE
            </button>
          </div>
        ))}
        <hr />
      </div>

  );
};

export default ItemList;